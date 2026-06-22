import "server-only";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGuestPartyId } from "@/server/session/guest-session";
import { decryptQrToken } from "./encryption";
import { buildPassUrl } from "./token";

/*
  Loads party-scoped active passes and decrypts their recoverable QR payloads on
  the server. The database stores a peppered lookup hash plus AES-GCM ciphertext;
  the raw token is never exposed outside the rendered pass URL.
*/

export type PassView = {
  inviteeId: string;
  label: string;
  status: "active" | "revoked" | "replaced";
  qrDataUrl: string | null;
};

export async function loadPasses(): Promise<{
  passes: PassView[];
} | null> {
  const partyId = await getGuestPartyId();
  if (!partyId) return null;

  const db = createAdminClient();
  if (!db) return null;

  const { data: rows } = await db
    .from("qr_passes")
    .select("invitee_id, status, token_ciphertext, invitees(full_name)")
    .eq("party_id", partyId)
    .eq("status", "active");

  const passes: PassView[] = await Promise.all(
    (rows ?? []).map(async (r) => {
      const invitee = Array.isArray(r.invitees) ? r.invitees[0] : r.invitees;
      let qrDataUrl: string | null = null;
      if (r.token_ciphertext) {
        const rawToken = decryptQrToken(r.token_ciphertext);
        qrDataUrl = await renderQrDataUrl(buildPassUrl(rawToken));
      }
      return {
        inviteeId: r.invitee_id as string,
        label: invitee?.full_name ?? "Guest",
        status: r.status,
        qrDataUrl,
      };
    }),
  );

  return { passes };
}

/** Render an opaque pass URL to a PNG data URL with a quiet zone. */
export async function renderQrDataUrl(passUrl: string): Promise<string> {
  return QRCode.toDataURL(passUrl, {
    errorCorrectionLevel: "M",
    margin: 4, // quiet zone
    width: 512,
    color: { dark: "#3f3a37", light: "#ffffff" },
  });
}
