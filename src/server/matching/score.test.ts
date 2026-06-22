import { describe, expect, it } from "vitest";
import {
  firstLastCompatible,
  scoreRaw,
  tokenOverlap,
  trigramSimilarity,
} from "./score";

describe("matching score", () => {
  it("scores exact names at full confidence", () => {
    expect(scoreRaw("Maria Santos", "Maria Santos").score).toBeCloseTo(1);
  });

  it("keeps a one-character typo reasonably close", () => {
    expect(trigramSimilarity("maria santos", "maria santso")).toBeGreaterThan(
      0.5,
    );
  });

  it("detects token and first/last compatibility", () => {
    expect(tokenOverlap("maria cruz", "maria dela cruz")).toBe(1);
    expect(firstLastCompatible("maria cruz", "maria dela cruz")).toBe(true);
  });

});
