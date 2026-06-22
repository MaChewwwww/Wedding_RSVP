import { describe, expect, it } from "vitest";
import {
  rsvpSubmitSchema,
  validatePartyResponses,
} from "./schema";

const valid = {
  partyId: "11111111-1111-4111-8111-111111111111",
  responses: [
    {
      inviteeId: "22222222-2222-4222-8222-222222222222",
      attendance: "attending",
    },
  ],
};

describe("RSVP validation", () => {
  it("accepts a valid party response", () => {
    expect(rsvpSubmitSchema.safeParse(valid).success).toBe(true);
  });

  it("requires exactly one response for the invitation guest", () => {
    expect(
      validatePartyResponses({
        submittedInviteeIds: ["one"],
        activePartyInviteeIds: ["one"],
      }),
    ).toEqual({ ok: true });

    expect(
      validatePartyResponses({
        submittedInviteeIds: ["outside"],
        activePartyInviteeIds: ["one"],
      }).ok,
    ).toBe(false);

    expect(
      validatePartyResponses({
        submittedInviteeIds: ["one", "two"],
        activePartyInviteeIds: ["one"],
      }).ok,
    ).toBe(false);
  });
});
