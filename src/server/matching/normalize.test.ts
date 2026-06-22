import { describe, expect, it } from "vitest";
import { foldAccents, normalizeName, tokenize } from "./normalize";

describe("normalizeName", () => {
  it("normalizes case, spacing, punctuation, and accents", () => {
    expect(normalizeName("  María  Dela-Cruz, Jr. ")).toBe(
      "maria dela cruz jr",
    );
  });

  it("removes apostrophes without splitting a surname", () => {
    expect(normalizeName("O’Brien")).toBe("obrien");
  });

  it("tokenizes normalized names", () => {
    expect(tokenize("maria dela cruz")).toEqual(["maria", "dela", "cruz"]);
  });

  it("folds combining accents", () => {
    expect(foldAccents("José")).toBe("Jose");
  });
});
