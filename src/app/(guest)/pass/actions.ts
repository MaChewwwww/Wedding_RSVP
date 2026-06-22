"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getGuestPartyId } from "@/server/session/guest-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { queuePassEmail } from "@/server/email/send";

export type ResendPassState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function resendPassEmailAction(
  _previous: ResendPassState,
): Promise<ResendPassState> {
  const partyId = await getGuestPartyId();
  if (!partyId) {
    return { status: "error", message: "Your guest session has expired." };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const clientId = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  if (
    !rateLimit(`emailResend:${partyId}:${clientId}`, RATE_LIMITS.emailResend)
      .success
  ) {
    return {
      status: "error",
      message: "Too many resend requests. Please try again later.",
    };
  }

  const db = createAdminClient();
  if (!db) {
    return { status: "error", message: "Email delivery is not configured." };
  }
  const { data: party } = await db
    .from("invitation_parties")
    .select("email")
    .eq("id", partyId)
    .single();
  if (!party?.email) {
    return {
      status: "error",
      message: "No email address is saved for this invitation.",
    };
  }

  const result = await queuePassEmail({
    partyId,
    email: party.email,
    purpose: "resend",
    requestId: randomUUID(),
  });
  return result.ok
    ? { status: "success" }
    : { status: "error", message: result.reason };
}
