import { describe, expect, it } from "vitest";
import {
  createPendingInvitationToken,
  verifyPendingInvitationToken,
} from "./pending-invitation";

describe("pending invitation token", () => {
  it("round-trips a party id before expiry", () => {
    const now = Date.UTC(2026, 5, 21);
    const token = createPendingInvitationToken("party-1", now);
    expect(verifyPendingInvitationToken(token, now + 1_000)?.partyId).toBe(
      "party-1",
    );
  });

  it("rejects tampering and expiry", () => {
    const now = Date.UTC(2026, 5, 21);
    const token = createPendingInvitationToken("party-1", now);
    expect(verifyPendingInvitationToken(`${token}x`, now)).toBeNull();
    expect(
      verifyPendingInvitationToken(token, now + 10 * 60 * 1000),
    ).toBeNull();
  });
});
