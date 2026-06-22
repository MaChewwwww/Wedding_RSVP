"use server";

import { randomUUID } from "node:crypto";
import { rsvpSubmitSchema } from "@/server/rsvp/schema";
import { submitRsvp } from "@/server/rsvp/service";
import { getGuestPartyId } from "@/server/session/guest-session";
import {
  DeadlinePassedError,
  isDeadlinePassed,
} from "@/server/rsvp/deadline";
import { queuePassEmail } from "@/server/email/send";
import { isBackendConfigured } from "@/config/env";
import { logger } from "@/lib/logger";

/*
  RSVP submit server action. Validates input, confirms the guest session owns the
  party, runs the shared RSVP transaction service (which re-checks the deadline),
  then attempts email AFTER the transaction so a send failure never rolls back
  the RSVP (docs/architecture.md, docs/user-flows.md "Email failure").
*/

export type RsvpActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "closed" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export async function submitRsvpAction(
  _prev: RsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  const requestId = randomUUID();

  if (!isBackendConfigured()) return { status: "unconfigured" };
  if (isDeadlinePassed()) return { status: "closed" };

  const sessionPartyId = await getGuestPartyId();
  if (!sessionPartyId) {
    return { status: "error", message: "Your session expired. Please look up your invitation again." };
  }

  // Reconstruct responses[] from the form (inviteeId -> attendance).
  const responses: { inviteeId: string; attendance: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("attendance:")) {
      responses.push({
        inviteeId: key.slice("attendance:".length),
        attendance: String(value),
      });
    }
  }

  const parsed = rsvpSubmitSchema.safeParse({
    partyId: sessionPartyId,
    responses,
    email: formData.get("email") || undefined,
  });
  if (!parsed.success) {
    logger.error("rsvp_validation_failed", {
      requestId,
      issues: parsed.error.issues,
      input: {
        partyId: sessionPartyId,
        responses,
        email: formData.get("email"),
      },
    });
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your responses." };
  }

  let result;
  try {
    result = await submitRsvp(parsed.data, { sessionPartyId, requestId });
  } catch (error) {
    if (error instanceof DeadlinePassedError) return { status: "closed" };
    logger.error("rsvp_submit_failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      status: "error",
      message: "We couldn't save your RSVP. Please try again.",
    };
  }
  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  // Post-commit, non-blocking email.
  if (parsed.data.email) {
    queuePassEmail({
      partyId: result.partyId,
      email: parsed.data.email,
      purpose: "initial_pass",
      requestId,
    }).catch((err) => {
      logger.error("rsvp_email_failed", {
        requestId,
        error: err instanceof Error ? err.message : "unknown",
      });
    });
  }

  return { status: "success" };
}
