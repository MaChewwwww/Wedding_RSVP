import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptQrToken } from "@/server/qr/encryption";
import { buildPassUrl } from "@/server/qr/token";
import QRCode from "qrcode";

/*
  Public API route that renders a QR pass image for a given invitee ID.
  Used primarily for embedding QR codes in emails, where CID and data URIs
  are unreliable across email clients (especially Gmail).

  Security: The invitee ID alone cannot be used to check in — the QR code
  contains an opaque token that must be validated server-side. Exposing the
  rendered QR image at a URL is equivalent to showing it on the pass page.
*/

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ inviteeId: string }> },
) {
  const { inviteeId } = await params;

  if (!inviteeId) {
    return new NextResponse("Missing invitee ID", { status: 400 });
  }

  const db = createAdminClient();
  if (!db) {
    return new NextResponse("Backend not configured", { status: 503 });
  }

  const { data: pass } = await db
    .from("qr_passes")
    .select("token_ciphertext")
    .eq("invitee_id", inviteeId)
    .eq("status", "active")
    .single();

  if (!pass?.token_ciphertext) {
    return new NextResponse("Pass not found", { status: 404 });
  }

  const rawToken = decryptQrToken(pass.token_ciphertext);
  const passUrl = buildPassUrl(rawToken);

  const pngBuffer = await QRCode.toBuffer(passUrl, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 512,
    color: { dark: "#3f3a37", light: "#ffffff" },
    type: "png",
  });

  return new NextResponse(pngBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
