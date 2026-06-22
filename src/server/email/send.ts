import "server-only";
import { Resend } from "resend";
import { createHash } from "node:crypto";
import { serverEnv, env } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { PassEmail } from "./pass-email";

/*
  Email delivery via Resend (docs/architecture.md "Email architecture",
  docs/security-and-privacy.md "Email"). Consent-gated by the caller. Records an
  email_deliveries row with an idempotency key (party + purpose + template
  version) so retries don't double-send. Never blocks RSVP success — the caller
  wraps this in try/catch.
*/

const TEMPLATE_VERSION = "pass-v1";

export type QueuePassEmailArgs = {
  partyId: string;
  email: string;
  purpose: "initial_pass" | "resend" | "update";
  requestId?: string;
};

export type QueuePassEmailResult =
  | { ok: true; deliveryId: string }
  | { ok: false; reason: string };

function idempotencyKey(partyId: string, purpose: string): string {
  const resendWindow =
    purpose === "resend"
      ? `:${Math.floor(Date.now() / (60 * 60 * 1000))}`
      : "";
  return createHash("sha256")
    .update(`${partyId}:${TEMPLATE_VERSION}:${purpose}${resendWindow}`)
    .digest("hex");
}

export async function queuePassEmail(
  args: QueuePassEmailArgs,
): Promise<QueuePassEmailResult> {
  const cfg = serverEnv();
  if (!cfg.ENABLE_EMAIL_DELIVERY) {
    return { ok: false, reason: "Email delivery is disabled." };
  }
  const apiKey = cfg.RESEND_API_KEY;
  const from = cfg.RESEND_FROM_EMAIL;
  const db = createAdminClient();
  if (!apiKey || !from || !db) {
    return { ok: false, reason: "Email backend not configured." };
  }

  const { data: party } = await db
    .from("invitation_parties")
    .select("display_name")
    .eq("id", args.partyId)
    .single();
  const partyName = party?.display_name ?? "Guest";

  // Fetch QR passes for the party
  const { data: qrPasses } = await db
    .from("qr_passes")
    .select("invitee_id, token_ciphertext, invitees(full_name)")
    .eq("party_id", args.partyId)
    .eq("status", "active");

  const { decryptQrToken } = await import("../qr/encryption");
  const { buildPassUrl } = await import("../qr/token");
  const { renderQrDataUrl } = await import("../qr/pass-loader");

  const passesData = await Promise.all(
    (qrPasses ?? []).map(async (r) => {
      const invitee = Array.isArray(r.invitees) ? r.invitees[0] : r.invitees;
      let qrDataUrl = "";
      if (r.token_ciphertext) {
        const rawToken = decryptQrToken(r.token_ciphertext);
        qrDataUrl = await renderQrDataUrl(buildPassUrl(rawToken));
      }
      return {
        id: r.invitee_id as string,
        label: invitee?.full_name ?? "Guest",
        qrDataUrl,
      };
    })
  );

  // Upload QR PNGs to Supabase Storage and get public URLs for the email.
  // This is necessary because Gmail blocks CID and data-URI images in emails,
  // and local API routes are unreachable by external mail clients during dev.
  const BUCKET = "qr-code";

  // Ensure the bucket exists (idempotent — won't fail if already created).
  const { error: bucketErr } = await db.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["image/png"],
  });
  // Ignore "already exists" error (code 23505 or message contains "already exists")
  if (bucketErr && !bucketErr.message?.toLowerCase().includes("already exists")) {
    logger.error("qr_bucket_create_failed", { error: bucketErr.message });
  }

  const passesWithUrls = await Promise.all(
    passesData.map(async (p) => {
      if (!p.qrDataUrl) return { ...p, publicUrl: "" };
      const base64Data = p.qrDataUrl.replace(/^data:image\/png;base64,/, "");
      const pngBuffer = Buffer.from(base64Data, "base64");
      const storagePath = `${args.partyId}/${p.id}.png`;

      // Upsert so re-sends overwrite cleanly.
      await db.storage
        .from(BUCKET)
        .upload(storagePath, pngBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      const { data: urlData } = db.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      return { ...p, publicUrl: urlData?.publicUrl ?? "" };
    })
  );

  // Still attach as fallback download (works regardless of email client).
  const attachments = passesData
    .filter((p) => p.qrDataUrl)
    .map((p) => {
      const base64Data = p.qrDataUrl.replace(/^data:image\/png;base64,/, "");
      return {
        filename: `wedding-pass-${p.label.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`,
        content: Buffer.from(base64Data, "base64"),
        content_type: "image/png",
      };
    });

  const key = idempotencyKey(args.partyId, args.purpose);

  // Record (or reuse) a delivery row keyed by idempotency key.
  const { data: delivery, error: insertErr } = await db
    .from("email_deliveries")
    .upsert(
      {
        party_id: args.partyId,
        recipient_email: args.email,
        purpose: args.purpose,
        status: "queued",
        idempotency_key: key,
      },
      { onConflict: "idempotency_key", ignoreDuplicates: false },
    )
    .select("id")
    .single();
  if (insertErr || !delivery) {
    return { ok: false, reason: "Could not record delivery." };
  }

  const passUrl = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/pass`;
  const resend = new Resend(apiKey);

  try {
    const { data: sent, error } = await resend.emails.send({
      from,
      to: args.email,
      subject: "Your wedding pass",
      react: PassEmail({ partyName, passUrl, passes: passesWithUrls }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    if (error) throw new Error(error.message);

    await db
      .from("email_deliveries")
      .update({ status: "sent", provider_message_id: sent?.id ?? null })
      .eq("id", delivery.id);

    logger.info("email_sent", {
      requestId: args.requestId,
      purpose: args.purpose,
    });
    return { ok: true, deliveryId: delivery.id };
  } catch (err) {
    await db
      .from("email_deliveries")
      .update({
        status: "failed",
        error_code: err instanceof Error ? err.message.slice(0, 120) : "unknown",
      })
      .eq("id", delivery.id);
    logger.error("email_send_failed", { requestId: args.requestId });
    return { ok: false, reason: "Email send failed." };
  }
}
