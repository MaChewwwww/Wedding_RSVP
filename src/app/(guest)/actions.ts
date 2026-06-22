"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { nameLookupSchema } from "@/server/rsvp/schema";
import { lookupInvitation } from "@/server/matching/lookup";
import { createGuestSession } from "@/server/session/guest-session";
import { loadPartyConfirmation } from "@/server/matching/confirmation";
import {
  clearPendingInvitation,
  getPendingInvitationPartyId,
  setPendingInvitation,
} from "@/server/session/pending-invitation";
import { isDeadlinePassed } from "@/server/rsvp/deadline";
import { isBackendConfigured } from "@/config/env";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/*
  Guest lookup server action (docs/user-flows.md "successful RSVP" /
  "ambiguous or failed name lookup"). All matching is server-side. The response
  is generic — we never return candidate names. Rate-limited by hashed IP.
*/

export type LookupActionState =
  | { status: "idle" }
  | {
      status: "confirmation";
      guestName: string;
    }
  | { status: "ambiguous" }
  | { status: "not_found" }
  | { status: "rate_limited" }
  | { status: "closed" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

async function hashedClientId(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function lookupAction(
  _prev: LookupActionState,
  formData: FormData,
): Promise<LookupActionState> {
  const requestId = randomUUID();

  const parsed = nameLookupSchema.safeParse({
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check your entry.",
    };
  }

  if (!isBackendConfigured()) {
    logger.warn("lookup_unconfigured", { requestId });
    return { status: "unconfigured" };
  }

  // Rate limit by hashed client id with a generic outcome on exhaustion.
  const clientId = await hashedClientId();
  const rl = rateLimit(`nameLookup:${clientId}`, RATE_LIMITS.nameLookup);
  if (!rl.success) {
    logger.warn("lookup_rate_limited", { requestId });
    return { status: "rate_limited" };
  }

  try {
    const result = await lookupInvitation(parsed.data.fullName, {
      requestId,
    });

    if (result.outcome === "matched") {
      const confirmation = await loadPartyConfirmation(result.partyId);
      if (!confirmation) return { status: "not_found" };

      await setPendingInvitation(result.partyId);
      return { status: "confirmation", ...confirmation };
    }
    if (result.outcome === "ambiguous") return { status: "ambiguous" };
    return { status: "not_found" };
  } catch (err) {
    logger.error("lookup_failed", {
      requestId,
      error: err instanceof Error ? err.message : "unknown",
    });
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export type ConfirmInvitationState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "expired" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export async function confirmInvitationAction(
  _prev: ConfirmInvitationState,
): Promise<ConfirmInvitationState> {
  void _prev;
  if (!isBackendConfigured()) return { status: "unconfigured" };

  const partyId = await getPendingInvitationPartyId();
  if (!partyId) return { status: "expired" };

  try {
    await createGuestSession(partyId);
    await clearPendingInvitation();
    return { status: "success" };
  } catch (err) {
    logger.error("invitation_confirmation_failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return {
      status: "error",
      message: "We couldn't confirm this invitation. Please try again.",
    };
  }
}

/** Whether RSVP mutations are currently open (display helper). */
export async function rsvpOpenState(): Promise<{ open: boolean }> {
  return { open: !isDeadlinePassed() };
}

import { loadCurrentParty, type PartyView } from "@/server/rsvp/loader";

export async function getPartyAction(): Promise<PartyView | null> {
  return await loadCurrentParty();
}

import { loadPasses, type PassView } from "@/server/qr/pass-loader";

export async function loadPassesAction(): Promise<{ passes: PassView[] } | null> {
  return await loadPasses();
}
