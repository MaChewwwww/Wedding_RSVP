import "server-only";

/*
  Rate limiting (docs/security-and-privacy.md): name lookup, login, resend, and
  QR validation must be throttled with increasing cooldowns after repeated
  failures. In production this should be backed by Upstash Redis. In
  scaffold-only mode (no Redis env) we fall back to an in-memory fixed-window
  limiter so the abuse-control code path is exercised and the app still runs.

  The in-memory store is per-process and resets on restart — adequate for local
  development, NOT for multi-instance production. The interface is stable so a
  Redis-backed implementation can drop in without touching callers.
*/

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
};

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export type RateLimitRule = {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export const RATE_LIMITS = {
  nameLookup: { limit: 8, windowMs: 60_000 },
  adminLogin: { limit: 10, windowMs: 5 * 60_000 },
  emailResend: { limit: 3, windowMs: 60 * 60_000 },
  qrValidate: { limit: 30, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

/**
 * Fixed-window rate limit check. `key` should combine the action and an
 * identifier (hashed IP / session / device), e.g. `nameLookup:<ipHash>`.
 */
export function rateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + rule.windowMs };
    store.set(key, bucket);
    return {
      success: true,
      remaining: rule.limit - 1,
      limit: rule.limit,
      resetAt: bucket.resetAt,
    };
  }

  existing.count += 1;
  const success = existing.count <= rule.limit;
  return {
    success,
    remaining: Math.max(0, rule.limit - existing.count),
    limit: rule.limit,
    resetAt: existing.resetAt,
  };
}

/** Test/maintenance helper to clear the in-memory window store. */
export function _resetRateLimitStore() {
  store.clear();
}
