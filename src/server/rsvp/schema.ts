import { z } from "zod";

/*
  Shared RSVP validation schemas (docs/security-and-privacy.md "Input and output
  handling"). The server is authoritative; the client reuses these for
  immediate feedback. Length limits guard against abuse and overflow.
*/

export const nameLookupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter the full name on your invitation.")
    .max(120, "That name is too long."),
});

export type NameLookupInput = z.infer<typeof nameLookupSchema>;

export const attendanceChoiceEnum = z.enum([
  "attending",
  "declined",
  "undecided",
]);
export type AttendanceChoice = z.infer<typeof attendanceChoiceEnum>;

export const inviteeResponseSchema = z.object({
  inviteeId: z.string().uuid(),
  attendance: attendanceChoiceEnum,
});

export const rsvpSubmitSchema = z.object({
  partyId: z.string().uuid(),
  responses: z
    .array(inviteeResponseSchema)
    .length(1, "Please submit one response for this invitation."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254)
    .optional()
    .or(z.literal("")),
});

export type RsvpSubmitInput = z.infer<typeof rsvpSubmitSchema>;

export function validatePartyResponses(args: {
  submittedInviteeIds: string[];
  activePartyInviteeIds: string[];
}): { ok: boolean; reason?: string } {
  const submitted = new Set(args.submittedInviteeIds);
  const allowed = new Set(args.activePartyInviteeIds);

  if (
    submitted.size !== args.submittedInviteeIds.length ||
    submitted.size !== 1 ||
    allowed.size !== 1
  ) {
    return {
      ok: false,
      reason: "This invitation must contain exactly one guest response.",
    };
  }

  for (const inviteeId of submitted) {
    if (!allowed.has(inviteeId)) {
      return {
        ok: false,
        reason: "The submitted guests do not match this invitation.",
      };
    }
  }

  return { ok: true };
}
