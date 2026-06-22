import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  Guest session (docs/architecture.md "Guest session model",
  docs/security-and-privacy.md "Guest session security"). After a safe match the
  guest gets a short-lived, party-scoped session: a high-entropy random token
  whose hash is stored in guest_sessions, with the raw token in an HTTP-only,
  Secure, SameSite cookie. This is NOT an account and grants access to one party
  only.
*/

const COOKIE_NAME = "ja_guest_session";

function hashToken(rawToken: string): string {
  const secret = serverEnv().GUEST_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${secret}:${rawToken}`).digest("hex");
}

function constantTimeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Create a session for a party, persist its hash, and set the cookie. */
export async function createGuestSession(partyId: string): Promise<void> {
  const env = serverEnv();
  const db = createAdminClient();
  if (!db) throw new Error("Backend not configured.");

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const ttlMs = env.GUEST_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  const { error } = await db.from("guest_sessions").insert({
    party_id: partyId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    last_seen_at: new Date().toISOString(),
  });
  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Resolve the current guest session to its party id, or null. */
export async function getGuestPartyId(): Promise<string | null> {
  const db = createAdminClient();
  if (!db) return null;

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const { data } = await db
    .from("guest_sessions")
    .select("party_id, token_hash, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .single();

  if (!data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;
  if (!constantTimeEqualHex(data.token_hash, tokenHash)) return null;

  await db
    .from("guest_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return data.party_id;
}

/** Clear the guest session cookie (does not revoke the DB record). */
export async function clearGuestSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
