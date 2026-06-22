import { normalizeName, tokenize } from "./normalize";

/*
  Confidence scoring (docs/architecture.md step 4). We approximate PostgreSQL
  pg_trgm similarity in pure TS so the decision logic is unit-testable without a
  database. At runtime the DB provides the candidate set and an authoritative
  trigram similarity; these helpers combine that with token-level signals.

  All functions are pure.
*/

/** Trigrams of a string, padded the way pg_trgm does (two leading, one trailing). */
export function trigrams(value: string): Set<string> {
  const set = new Set<string>();
  const words = tokenize(value);
  for (const word of words) {
    const padded = `  ${word} `;
    for (let i = 0; i < padded.length - 2; i++) {
      set.add(padded.slice(i, i + 3));
    }
  }
  return set;
}

/** Jaccard trigram similarity, comparable to pg_trgm similarity(). */
export function trigramSimilarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  for (const t of ta) if (tb.has(t)) intersection++;
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Fraction of query tokens that appear in the candidate token set. */
export function tokenOverlap(query: string, candidate: string): number {
  const q = tokenize(query);
  const c = new Set(tokenize(candidate));
  if (q.length === 0) return 0;
  let hits = 0;
  for (const t of q) if (c.has(t)) hits++;
  return hits / q.length;
}

/** Whether first and last tokens are compatible (same or one is a prefix). */
export function firstLastCompatible(query: string, candidate: string): boolean {
  const q = tokenize(query);
  const c = tokenize(candidate);
  if (q.length === 0 || c.length === 0) return false;
  const compat = (x: string, y: string) =>
    x === y || x.startsWith(y) || y.startsWith(x);
  return (
    compat(q[0], c[0]) && compat(q[q.length - 1], c[c.length - 1])
  );
}

export type ScoreSignals = {
  trigram: number;
  tokenOverlap: number;
  firstLastCompatible: boolean;
};

/**
 * Combined confidence in [0,1]. Weighted blend of trigram similarity and token
 * overlap, nudged by first/last compatibility.
 * `dbTrigram`, when provided, overrides the local trigram estimate with the
 * authoritative pg_trgm value.
 */
export function scoreCandidate(
  queryNormalized: string,
  candidateNormalized: string,
  opts: { dbTrigram?: number } = {},
): { score: number; signals: ScoreSignals } {
  const trigram =
    opts.dbTrigram ?? trigramSimilarity(queryNormalized, candidateNormalized);
  const overlap = tokenOverlap(queryNormalized, candidateNormalized);
  const flCompat = firstLastCompatible(queryNormalized, candidateNormalized);

  let score = 0.6 * trigram + 0.3 * overlap;
  if (flCompat) score += 0.1;
  score = Math.min(1, score);

  return {
    score,
    signals: {
      trigram,
      tokenOverlap: overlap,
      firstLastCompatible: flCompat,
    },
  };
}

/** Convenience: normalize then score raw inputs. */
export function scoreRaw(
  query: string,
  candidate: string,
  opts?: { dbTrigram?: number },
) {
  return scoreCandidate(normalizeName(query), normalizeName(candidate), opts);
}
