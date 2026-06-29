"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeName } from "@/server/matching/normalize";
import { generateRawToken, hashToken } from "@/server/qr/token";
import { encryptQrToken } from "@/server/qr/encryption";
import { randomUUID } from "node:crypto";
import { queuePassEmail } from "@/server/email/send";
import { logger } from "@/lib/logger";

export type AdminFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const invitationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export async function createPartyAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const parsed = invitationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const db = createAdminClient();
  if (!db) return { status: "error", message: "Backend not configured." };
  
  const normalized = normalizeName(parsed.data.fullName);
  const { data: existing } = await db
    .from("invitees")
    .select("id")
    .eq("normalized_name", normalized)
    .maybeSingle();
    
  if (existing) {
    return { status: "error", message: `A guest named "${parsed.data.fullName}" already exists.` };
  }

  const { data: party, error: partyError } = await db
    .from("invitation_parties")
    .insert({
      display_name: parsed.data.fullName,
      email: parsed.data.email || null,
      invitation_code_hash: null,
    })
    .select("id")
    .single();
  if (partyError || !party) {
    return { status: "error", message: "Could not create the guest invitation." };
  }

  const { error: inviteeError } = await db.from("invitees").insert({
    party_id: party.id,
    full_name: parsed.data.fullName,
    normalized_name: normalizeName(parsed.data.fullName),
  });
  if (inviteeError) {
    await db.from("invitation_parties").delete().eq("id", party.id);
    return { status: "error", message: "Could not create the invited guest." };
  }

  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "party.create",
    entity_type: "invitation_party",
    entity_id: party.id,
    after: { full_name: parsed.data.fullName },
  });
  revalidatePath("/admin/guests");
  revalidatePath("/admin");
  return { status: "success", message: "Guest invitation created." };
}

export async function deleteGuestAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const partyId = z.string().uuid().parse(formData.get("partyId"));
  const db = createAdminClient();
  if (!db) return;

  const { data: party } = await db
    .from("invitation_parties")
    .select("display_name")
    .eq("id", partyId)
    .single();

  // Hard delete. FK cascades remove invitees, qr_passes, attendance_events,
  // and guest_sessions for this party.
  const { error } = await db
    .from("invitation_parties")
    .delete()
    .eq("id", partyId);
  if (error) throw new Error(error.message);

  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "guest.delete",
    entity_type: "invitation_party",
    entity_id: partyId,
    before: { full_name: party?.display_name ?? null },
  });
  revalidatePath("/admin/guests");
  revalidatePath("/admin");
}

export async function importGuestsAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const csv = z.string().min(1).max(500_000).safeParse(formData.get("csv"));
  if (!csv.success) return { status: "error", message: "Paste a valid CSV." };
  const lines = csv.data.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const rows = lines.map(line => {
    const parts = line.split(",");
    return {
      full_name: parts[0].trim(),
      email: parts.length > 1 ? parts[1].trim() : null
    };
  });

  if (rows.length === 0) {
    return { status: "error", message: "No data provided." };
  }

  for (const row of rows) {
    if (!row.full_name) {
      return {
        status: "error",
        message: "Every row requires a name.",
      };
    }
  }

  const db = createAdminClient();
  if (!db) return { status: "error", message: "Backend not configured." };

  const { data: existingInvitees } = await db.from("invitees").select("normalized_name");
  const existingSet = new Set((existingInvitees || []).map(i => i.normalized_name));

  let created = 0;
  let skipped = 0;
  for (const row of rows) {
    const fullName = row.full_name.trim();
    const normalized = normalizeName(fullName);
    
    if (existingSet.has(normalized)) {
      skipped++;
      continue;
    }
    
    existingSet.add(normalized); // Prevent duplicates within the CSV itself

    const { data: party, error } = await db
      .from("invitation_parties")
      .insert({
        display_name: fullName,
        email: row.email || null,
        invitation_code_hash: null,
      })
      .select("id")
      .single();
    if (error || !party) {
      return {
        status: "error",
        message: `Import stopped while creating ${fullName}.`,
      };
    }
    const { error: inviteeError } = await db.from("invitees").insert({
      party_id: party.id,
      full_name: fullName,
      normalized_name: normalizeName(fullName),
    });
    if (inviteeError) {
      await db.from("invitation_parties").delete().eq("id", party.id);
      return {
        status: "error",
        message: `Import stopped while creating ${fullName}.`,
      };
    }
    created += 1;
  }

  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "party.csv_import",
    entity_type: "invitation_party",
    after: { parties_created: created, rows: rows.length },
  });
  revalidatePath("/admin/guests");
  return {
    status: "success",
    message: `Imported ${created} guests.${skipped > 0 ? ` Skipped ${skipped} duplicates.` : ""}`,
  };
}

export async function revokePassAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const passId = z.string().uuid().parse(formData.get("passId"));
  const db = createAdminClient();
  if (!db) return;
  await db
    .from("qr_passes")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", passId)
    .eq("status", "active");
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "qr.revoke",
    entity_type: "qr_pass",
    entity_id: passId,
  });
  revalidatePath("/admin/guests");
}

export async function reissuePassAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const inviteeId = z.string().uuid().parse(formData.get("inviteeId"));
  const db = createAdminClient();
  if (!db) return;
  const { data: invitee } = await db
    .from("invitees")
    .select("party_id, rsvp_status")
    .eq("id", inviteeId)
    .single();
  if (!invitee || invitee.rsvp_status !== "attending") {
    throw new Error("Only attending invitees can receive a pass.");
  }

  const { data: existing } = await db
    .from("qr_passes")
    .select("id")
    .eq("invitee_id", inviteeId)
    .eq("status", "active")
    .maybeSingle();
  if (existing) {
    await db
      .from("qr_passes")
      .update({ status: "replaced", revoked_at: new Date().toISOString() })
      .eq("id", existing.id);
  }

  const rawToken = generateRawToken();
  const { data: replacement } = await db
    .from("qr_passes")
    .insert({
      invitee_id: inviteeId,
      party_id: invitee.party_id,
      token_hash: hashToken(rawToken),
      token_ciphertext: encryptQrToken(rawToken),
      status: "active",
    })
    .select("id")
    .single();
  if (existing && replacement) {
    await db
      .from("qr_passes")
      .update({ replaced_by_id: replacement.id })
      .eq("id", existing.id);
  }
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "qr.reissue",
    entity_type: "invitee",
    entity_id: inviteeId,
  });
  revalidatePath("/admin/guests");
}

export async function adminRsvpOverrideAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      inviteeId: z.string().uuid(),
      status: z.enum(["pending", "attending", "declined"]),
      reason: z.string().trim().min(3).max(300),
      sendEmail: z.enum(["true", "false"]).optional(),
    })
    .parse({
      inviteeId: formData.get("inviteeId"),
      status: formData.get("status"),
      reason: formData.get("reason"),
      sendEmail: formData.get("sendEmail") === "true" ? "true" : "false",
    });
  const db = createAdminClient();
  if (!db) return;
  const { data: invitee } = await db
    .from("invitees")
    .select("party_id, rsvp_status")
    .eq("id", parsed.inviteeId)
    .single();
  if (!invitee) throw new Error("Invitee not found.");

  await db
    .from("invitees")
    .update({
      rsvp_status: parsed.status,
      table_id: parsed.status === "declined" ? null : undefined,
    })
    .eq("id", parsed.inviteeId);

  await db
    .from("invitation_parties")
    .update({
      rsvp_status: parsed.status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", invitee.party_id);

  if (parsed.status === "attending" && parsed.sendEmail === "true") {
    const { data: existingPass } = await db
      .from("qr_passes")
      .select("id")
      .eq("invitee_id", parsed.inviteeId)
      .eq("status", "active")
      .maybeSingle();

    if (!existingPass) {
      const rawToken = generateRawToken();
      await db.from("qr_passes").insert({
        invitee_id: parsed.inviteeId,
        party_id: invitee.party_id,
        token_hash: hashToken(rawToken),
        token_ciphertext: encryptQrToken(rawToken),
        status: "active",
      });
      await db.from("audit_logs").insert({
        actor_user_id: admin.userId,
        action: "qr.issue_admin",
        entity_type: "invitee",
        entity_id: parsed.inviteeId,
      });
    }

    const { data: party } = await db
      .from("invitation_parties")
      .select("email")
      .eq("id", invitee.party_id)
      .single();

    if (party?.email) {
      queuePassEmail({
        partyId: invitee.party_id,
        email: party.email,
        purpose: "update",
        requestId: randomUUID(),
      }).catch((err) => {
        logger.error("admin_override_email_failed", {
          error: err instanceof Error ? err.message : "unknown",
        });
      });
    }
  }

  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "rsvp.admin_override",
    entity_type: "invitee",
    entity_id: parsed.inviteeId,
    before: { rsvp_status: invitee.rsvp_status },
    after: { rsvp_status: parsed.status, reason: parsed.reason },
  });
  revalidatePath("/admin/guests");
  revalidatePath("/admin");
}
