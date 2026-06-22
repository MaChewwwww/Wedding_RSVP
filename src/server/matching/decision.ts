/*
  Match decision (docs/architecture.md step 5, docs/security-and-privacy.md
  "Name-lookup protection"). The 0.85 score is ONLY a candidate threshold, never
  identity proof on its own. Auto-proceed requires ALL of:
    - top score >= threshold
    - gap to second-best >= minGap
    - candidate is active
    - no duplicate/ambiguity flag

  Otherwise we return a generic ambiguous/not-found outcome. We NEVER return
  candidate names to the guest — the caller maps `matched` to a confirmation of
  the single party, and anything else to a generic message.

  Pure function: no DB, no I/O.
*/

export type Candidate = {
  partyId: string;
  inviteeId: string;
  /** Combined confidence in [0,1] from scoreCandidate. */
  score: number;
  isActive: boolean;
  /** Set when admin flagged this record as a known duplicate/ambiguous. */
  hasDuplicateFlag: boolean;
};

export type MatchDecision =
  | { outcome: "matched"; partyId: string; inviteeId: string }
  | { outcome: "ambiguous" }
  | { outcome: "not_found" };

export type DecisionConfig = {
  threshold: number;
  minGap: number;
};

export function decideMatch(
  candidates: Candidate[],
  config: DecisionConfig,
): MatchDecision {
  const active = candidates
    .filter((c) => c.isActive)
    .sort((a, b) => b.score - a.score);

  if (active.length === 0) return { outcome: "not_found" };

  const top = active[0];

  // Below the candidate threshold — treat as no safe match.
  if (top.score < config.threshold) return { outcome: "not_found" };

  // Admin-flagged ambiguity always blocks an auto-match.
  if (top.hasDuplicateFlag) return { outcome: "ambiguous" };

  const second = active[1];
  if (second && top.score - second.score < config.minGap) {
    return { outcome: "ambiguous" };
  }

  return {
    outcome: "matched",
    partyId: top.partyId,
    inviteeId: top.inviteeId,
  };
}
