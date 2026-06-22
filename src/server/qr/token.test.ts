import { describe, expect, it } from "vitest";
import {
  buildPassUrl,
  generateRawToken,
  hashToken,
  verifyToken,
} from "./token";

describe("QR tokens", () => {
  it("generates at least 256 bits of URL-safe entropy", () => {
    const token = generateRawToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
  });

  it("hashes and verifies without storing the raw token", () => {
    const token = generateRawToken();
    const hash = hashToken(token);
    expect(hash).not.toContain(token);
    expect(verifyToken(token, hash)).toBe(true);
    expect(verifyToken(`${token}x`, hash)).toBe(false);
  });

  it("builds a pass URL without personal data", () => {
    expect(buildPassUrl("opaque-token")).toBe(
      "http://localhost:3000/api/check-in/opaque-token",
    );
  });
});
