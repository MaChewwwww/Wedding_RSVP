/*
  Name normalization (docs/architecture.md "Name matching pipeline" step 1).
  Pure and deterministic so it can be unit-tested and reused as the canonical
  `normalized_name` written to the database.

  Steps: Unicode NFKD normalize, lowercase, strip non-meaningful punctuation,
  collapse whitespace, trim. We intentionally KEEP letters across scripts and
  only remove punctuation; accent folding is opt-in (see foldAccents) because
  docs/tech-stack.md notes unaccent must be tested carefully against the real
  roster before enabling.
*/

/** Remove combining diacritical marks after NFKD decomposition. */
export function foldAccents(input: string): string {
  return input.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function normalizeName(input: string): string {
  return (
    input
      .normalize("NFKD")
      .toLowerCase()
      // Replace hyphens/underscores/dots with spaces so "Dela-Cruz" -> "dela cruz".
      .replace(/[-_.]+/g, " ")
      // Drop apostrophes/quotes entirely so "O'Brien" -> "obrien".
      .replace(/['’`"]+/g, "")
      // Remove any remaining punctuation/symbols, keep letters, marks, numbers, space.
      .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, " ")
      // Strip combining marks left over (accent-insensitive baseline for search).
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Tokenize a normalized name into word tokens. */
export function tokenize(normalized: string): string[] {
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}
