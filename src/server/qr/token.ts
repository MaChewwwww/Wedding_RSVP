import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/env";
import { env } from "@/config/env";

/*
  Opaque QR token handling (docs/security-and-privacy.md "QR security"):
    - >=128 bits of CSPRNG randomness, URL-safe.
    - Store only a hash at rest (peppered SHA-256).
    - The QR encodes a URL containing the raw token — no name, table, email, or
      DB UUID. Validation is server-side and idempotent.

  The same pepper-hash approach is reused for guest session tokens.
*/

const TOKEN_BYTES = 32; // 256 bits

export function generateRawToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Peppered SHA-256 of a raw token, hex-encoded. */
export function hashToken(rawToken: string): string {
  const pepper = serverEnv().QR_TOKEN_PEPPER ?? "";
  return createHash("sha256").update(`${pepper}:${rawToken}`).digest("hex");
}

/** Constant-time comparison of a raw token against a stored hash. */
export function verifyToken(rawToken: string, storedHash: string): boolean {
  const computed = hashToken(rawToken);
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Build the scannable pass URL for a raw token. */
export function buildPassUrl(rawToken: string): string {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return `${base}/api/check-in/${rawToken}`;
}
