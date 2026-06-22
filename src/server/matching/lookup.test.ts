import { describe, expect, it } from "vitest";
import { lookupInvitation } from "./lookup";
import type { CandidateRow, MatchRepository } from "./repository";

function row(
  partyId: string,
  inviteeId: string,
  normalizedName: string,
  similarity: number,
): CandidateRow {
  return {
    partyId,
    inviteeId,
    normalizedName,
    isActive: true,
    partyActive: true,
    dbSimilarity: similarity,
  };
}

function repository(overrides: Partial<MatchRepository>): MatchRepository {
  return {
    findExact: async () => [],
    findFuzzy: async () => [],
    ...overrides,
  };
}

describe("lookupInvitation", () => {
  it("matches one invited guest", async () => {
    const repo = repository({
      findFuzzy: async () => [
        row("party-1", "invitee-1", "maria santos", 0.95),
      ],
    });

    await expect(
      lookupInvitation("Maria Santos", { repository: repo }),
    ).resolves.toMatchObject({ outcome: "matched", partyId: "party-1" });
  });
});
