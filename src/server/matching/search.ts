import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeName } from "./normalize";
import { scoreCandidate } from "./score";
import {
  createMatchRepository,
  type MatchRepository,
} from "./repository";

/*
  Name SEARCH (distinct from the strict lookup in lookup.ts). Returns a small
  list of the closest-matching invitations WITH their display names so the guest
  can pick their own from a radio list. This intentionally surfaces guest names
  (product decision) — callers must still rate-limit. Ordered by match score.
*/

export type SearchCandidate = {
  partyId: string;
  guestName: string;
};

export async function searchInvitations(
  rawName: string,
  opts: { limit?: number; repository?: MatchRepository } = {},
): Promise<SearchCandidate[]> {
  const limit = opts.limit ?? 8;
  const normalized = normalizeName(rawName);
  if (normalized.length < 2) return [];

  const repo = opts.repository ?? createMatchRepository();
  const [exact, fuzzy] = await Promise.all([
    repo.findExact(normalized),
    repo.findFuzzy(normalized, Math.max(limit, 12)),
  ]);

  // Best score per active party.
  const bestByParty = new Map<string, number>();
  for (const row of [...exact, ...fuzzy]) {
    if (!(row.isActive && row.partyActive)) continue;
    const { score } = scoreCandidate(normalized, row.normalizedName, {
      dbTrigram: row.dbSimilarity,
    });
    const existing = bestByParty.get(row.partyId);
    if (existing === undefined || score > existing) {
      bestByParty.set(row.partyId, score);
    }
  }

  const ranked = [...bestByParty.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([partyId]) => partyId);

  if (ranked.length === 0) return [];

  // Fetch display names for the ranked parties, preserving rank order.
  const db = createAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("invitees")
    .select("party_id, full_name")
    .in("party_id", ranked)
    .eq("is_active", true);
  if (error || !data) return [];

  const nameByParty = new Map<string, string>();
  for (const row of data) {
    if (!nameByParty.has(row.party_id)) nameByParty.set(row.party_id, row.full_name);
  }

  return ranked
    .map((partyId) => {
      const guestName = nameByParty.get(partyId);
      return guestName ? { partyId, guestName } : null;
    })
    .filter((c): c is SearchCandidate => c !== null);
}
