import { describe, expect, it } from "vitest";
import { decideMatch, type Candidate } from "./decision";

const base: Candidate = {
  partyId: "party-1",
  inviteeId: "invitee-1",
  score: 0.92,
  isActive: true,
  hasDuplicateFlag: false,
};

describe("decideMatch", () => {
  const config = { threshold: 0.85, minGap: 0.08 };

  it("matches one active high-confidence candidate", () => {
    expect(decideMatch([base], config)).toEqual({
      outcome: "matched",
      partyId: "party-1",
      inviteeId: "invitee-1",
    });
  });

  it("rejects candidates below threshold", () => {
    expect(decideMatch([{ ...base, score: 0.84 }], config)).toEqual({
      outcome: "not_found",
    });
  });

  it("returns ambiguous when the top-two gap is too small", () => {
    expect(
      decideMatch(
        [
          base,
          { ...base, partyId: "party-2", inviteeId: "invitee-2", score: 0.88 },
        ],
        config,
      ),
    ).toEqual({ outcome: "ambiguous" });
  });

  it("does not auto-match a duplicate-flagged record", () => {
    expect(
      decideMatch([{ ...base, hasDuplicateFlag: true }], config),
    ).toEqual({ outcome: "ambiguous" });
  });
});
