import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeName } from "./normalize";
import { trigramSimilarity } from "./score";

/*
  Candidate retrieval (docs/architecture.md step 3). Behind an interface so the
  decision pipeline can be unit-tested with an in-memory implementation while
  production uses pg_trgm via the service-role client. Returns a SMALL candidate
  set — never the full guest list — and includes the authoritative pg_trgm
  similarity so scoring matches the database.
*/

export type CandidateRow = {
  partyId: string;
  inviteeId: string;
  normalizedName: string;
  isActive: boolean;
  partyActive: boolean;
  dbSimilarity: number;
};

export interface MatchRepository {
  /** Exact normalized-name or alias matches. */
  findExact(normalized: string): Promise<CandidateRow[]>;
  /** Small fuzzy candidate set via trigram similarity, capped. */
  findFuzzy(normalized: string, limit: number): Promise<CandidateRow[]>;
}

/**
 * Supabase-backed repository. Uses an RPC `match_invitees` (defined in a
 * migration alongside pg_trgm) when available; falls back to ilike for exact.
 * Returns [] when the backend is not configured (scaffold-only mode).
 */
export function createMatchRepository(): MatchRepository {
  const db = createAdminClient();

  return {
    async findExact(normalized) {
      if (!db) return [];
      const { data: invitees, error: inviteeError } = await db
        .from("invitees")
        .select(
          "id, party_id, normalized_name, is_active, invitation_parties!inner(status)",
        )
        .eq("normalized_name", normalized)
        .eq("is_active", true)
        .limit(10);
      if (inviteeError) return [];

      const { data: aliases, error: aliasError } = await db
        .from("invitee_aliases")
        .select(
          "invitees!inner(id, party_id, normalized_name, is_active, invitation_parties!inner(status))",
        )
        .eq("normalized_alias", normalized)
        .limit(10);

      const aliasRows =
        aliasError || !aliases
          ? []
          : aliases
              .map((row) => {
                const invitee = Array.isArray(row.invitees)
                  ? row.invitees[0]
                  : row.invitees;
                return invitee
                  ? mapRow(invitee as unknown as RawRow, 1)
                  : null;
              })
              .filter((row): row is CandidateRow => row !== null);

      return [
        ...(invitees ?? []).map((row) => mapRow(row, 1)),
        ...aliasRows,
      ];
    },

    async findFuzzy(normalized, limit) {
      if (!db) return [];
      const { data, error } = await db.rpc("match_invitees", {
        query: normalized,
        match_limit: limit,
      });
      if (!error && data && data.length > 0) {
        return (data as RpcRow[]).map((r) => ({
          partyId: r.party_id,
          inviteeId: r.invitee_id,
          normalizedName: r.normalized_name,
          isActive: r.is_active,
          partyActive: r.party_status === "active",
          dbSimilarity: r.similarity,
        }));
      }

      // Fallback: If RPC fails (e.g. pg_trgm missing) or returns empty, do local JS scoring.
      // A wedding has ~200 guests so fetching all active names is extremely fast.
      const { data: allGuests } = await db
        .from("invitees")
        .select("id, party_id, normalized_name, is_active, invitation_parties!inner(status)")
        .eq("is_active", true);
        
      if (!allGuests) return [];

      const scored = allGuests.map((row) => {
        const party = Array.isArray(row.invitation_parties) ? row.invitation_parties[0] : row.invitation_parties;
        return {
          partyId: row.party_id,
          inviteeId: row.id,
          normalizedName: row.normalized_name,
          isActive: row.is_active,
          partyActive: party?.status === "active",
          dbSimilarity: trigramSimilarity(normalized, row.normalized_name),
        };
      });

      return scored
        .filter((c) => c.dbSimilarity > 0.3)
        .sort((a, b) => b.dbSimilarity - a.dbSimilarity)
        .slice(0, limit);
    },


  };

  function mapRow(r: RawRow, similarity: number): CandidateRow {
    const party = Array.isArray(r.invitation_parties)
      ? r.invitation_parties[0]
      : r.invitation_parties;
    return {
      partyId: r.party_id,
      inviteeId: r.id,
      normalizedName: r.normalized_name,
      isActive: r.is_active,
      partyActive: party?.status === "active",
      dbSimilarity: similarity,
    };
  }
}

type RawRow = {
  id: string;
  party_id: string;
  normalized_name: string;
  is_active: boolean;
  invitation_parties: { status: string } | { status: string }[];
};

type RpcRow = {
  invitee_id: string;
  party_id: string;
  normalized_name: string;
  is_active: boolean;
  party_status: string;
  similarity: number;
};

/** Normalize a raw lookup string the same way records are normalized. */
export function normalizeLookup(raw: string): string {
  return normalizeName(raw);
}
