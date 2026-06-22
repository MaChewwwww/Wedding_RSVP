import "server-only";
import { serverEnv } from "@/config/env";
import { logger } from "@/lib/logger";
import { normalizeName } from "./normalize";
import { scoreCandidate } from "./score";
import { decideMatch, type Candidate, type MatchDecision } from "./decision";
import {
  createMatchRepository,
  type MatchRepository,
} from "./repository";

/*
  End-to-end name lookup (docs/architecture.md, docs/security-and-privacy.md).
  Combines normalize -> candidate retrieval -> scoring -> decision. The OUTCOME
  returned to the caller is deliberately generic: matched (single party to
  confirm), ambiguous, or not_found. Candidate names are never surfaced.

  Accepts an injectable repository so it can be unit-tested without a DB.
*/

export type LookupResult =
  | { outcome: "matched"; partyId: string; inviteeId: string }
  | { outcome: "ambiguous" }
  | { outcome: "not_found" };

export async function lookupInvitation(
  rawName: string,
  opts: {
    requestId?: string;
    repository?: MatchRepository;
  } = {},
): Promise<LookupResult> {
  const env = serverEnv();
  const normalized = normalizeName(rawName);
  const repo = opts.repository ?? createMatchRepository();

  // 1. Exact normalized-name / alias match short-circuits to high confidence.
  const exact = await repo.findExact(normalized);
  const fuzzy = await repo.findFuzzy(normalized, 5);

  // Merge, de-duplicating by inviteeId, preferring exact (similarity 1).
  const byInvitee = new Map<string, Candidate>();
  for (const row of [...exact, ...fuzzy]) {
    const { score } = scoreCandidate(normalized, row.normalizedName, {
      dbTrigram: row.dbSimilarity,
    });
    const existing = byInvitee.get(row.inviteeId);
    const candidate: Candidate = {
      partyId: row.partyId,
      inviteeId: row.inviteeId,
      score,
      isActive: row.isActive && row.partyActive,
      hasDuplicateFlag: false,
    };
    if (!existing || candidate.score > existing.score) {
      byInvitee.set(row.inviteeId, candidate);
    }
  }

  const eligibleCandidates = [...byInvitee.values()];
  const bestByParty = new Map<string, Candidate>();
  for (const candidate of eligibleCandidates) {
    const existing = bestByParty.get(candidate.partyId);
    if (!existing || candidate.score > existing.score) {
      bestByParty.set(candidate.partyId, candidate);
    }
  }

  const decision: MatchDecision = decideMatch([...bestByParty.values()], {
    threshold: env.NAME_MATCH_THRESHOLD,
    minGap: env.NAME_MATCH_MIN_GAP,
  });

  // Privacy-aware logging: never log the raw name or candidate names/scores.
  logger.info("invitation_lookup", {
    requestId: opts.requestId,
    outcome: decision.outcome,
    candidateCount: byInvitee.size,
  });

  return decision;
}
