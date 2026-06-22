import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { assertDeadlineOpen } from "./deadline";
import {
  validatePartyResponses,
  type RsvpSubmitInput,
} from "./schema";
import { generateRawToken, hashToken } from "@/server/qr/token";
import { encryptQrToken } from "@/server/qr/encryption";

/*
  RSVP transaction service (docs/architecture.md "RSVP transaction"). This is the
  single shared server path every guest mutation goes through; the deadline check
  lives HERE so stale pages and direct requests cannot bypass it. Steps:

    1. Re-check RSVP_DEADLINE (reject if now >= deadline).
    2. Validate guest session owns this party (caller passes the verified id).
    3. Validate the single invitee belongs to this invitation.
    4. Upsert party + per-invitee attendance.
    5. Issue a QR pass per attending invitee if absent (CHECK_IN_MODE=invitee).
    6. Write an audit event.

  Email is attempted by the caller AFTER this returns — never inside, so an email
  failure cannot roll back the RSVP. Steps 3–6 are delegated to a SECURITY
  DEFINER RPC (`submit_rsvp`) so they commit atomically in one DB transaction;
  this orchestrator handles auth/deadline and QR token generation.
*/

export type RsvpServiceResult =
  | { ok: true; partyId: string }
  | { ok: false; reason: string };

export async function submitRsvp(
  input: RsvpSubmitInput,
  ctx: { sessionPartyId: string; requestId?: string },
): Promise<RsvpServiceResult> {
  const requestId = ctx.requestId ?? randomUUID();

  // 1. Deadline is a server authorization rule, re-checked on every mutation.
  assertDeadlineOpen();

  // 2. The session must own the party it is mutating.
  if (input.partyId !== ctx.sessionPartyId) {
    logger.warn("rsvp_party_mismatch", { requestId });
    return { ok: false, reason: "This invitation doesn't match your session." };
  }

  const db = createAdminClient();
  if (!db) return { ok: false, reason: "Backend not configured." };

  // 3. Validate the one-to-one invitation/guest relationship.
  const { data: party, error: partyErr } = await db
    .from("invitation_parties")
    .select("id, status")
    .eq("id", input.partyId)
    .single();
  if (partyErr || !party) return { ok: false, reason: "Invitation not found." };
  if (party.status !== "active")
    return { ok: false, reason: "This invitation is no longer active." };

  const { data: activeInvitees, error: inviteeErr } = await db
    .from("invitees")
    .select("id")
    .eq("party_id", input.partyId)
    .eq("is_active", true);
  if (inviteeErr || !activeInvitees) {
    return { ok: false, reason: "We couldn't verify this invitation." };
  }

  const membershipCheck = validatePartyResponses({
    submittedInviteeIds: input.responses.map((response) => response.inviteeId),
    activePartyInviteeIds: activeInvitees.map((invitee) => invitee.id),
  });
  if (!membershipCheck.ok) {
    logger.warn("rsvp_membership_rejected", { requestId });
    return { ok: false, reason: membershipCheck.reason! };
  }

  const attendingCount =
    input.responses[0]?.attendance === "attending" ? 1 : 0;

  // Pre-generate QR tokens for attending invitees (raw token returned to none;
  // only hashes are persisted). The RPC issues a pass row per token.
  const passes = input.responses
    .filter((r) => r.attendance === "attending")
    .map((r) => {
      const raw = generateRawToken();
      return {
        inviteeId: r.inviteeId,
        tokenHash: hashToken(raw),
        tokenCiphertext: encryptQrToken(raw),
      };
    });

  // 4–6. Atomic commit via RPC.
  const { error: rpcErr } = await db.rpc("submit_rsvp", {
    p_party_id: input.partyId,
    p_responses: input.responses,
    p_email: input.email || null,
    p_passes: passes,
    p_request_id: requestId,
  });
  if (rpcErr) {
    logger.error("rsvp_commit_failed", { requestId, error: rpcErr.message });
    return { ok: false, reason: "We couldn't save your RSVP. Please retry." };
  }

  logger.info("rsvp_submitted", {
    requestId,
    attendingCount,
  });
  return { ok: true, partyId: input.partyId };
}
