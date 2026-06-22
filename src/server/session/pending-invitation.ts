import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/config/env";

const COOKIE_NAME = "ja_pending_invitation";
const TTL_SECONDS = 10 * 60;

type PendingInvitation = {
  partyId: string;
  expiresAt: number;
  nonce: string;
};

function sign(encodedPayload: string): string {
  return createHmac("sha256", serverEnv().GUEST_SESSION_SECRET ?? "")
    .update(encodedPayload)
    .digest("base64url");
}

export function createPendingInvitationToken(
  partyId: string,
  now = Date.now(),
): string {
  const payload: PendingInvitation = {
    partyId,
    expiresAt: now + TTL_SECONDS * 1000,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyPendingInvitationToken(
  token: string,
  now = Date.now(),
): PendingInvitation | null {
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return null;

  const actual = Buffer.from(sign(encoded));
  const supplied = Buffer.from(suppliedSignature);
  if (
    actual.length !== supplied.length ||
    !timingSafeEqual(actual, supplied)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as PendingInvitation;
    if (
      typeof payload.partyId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.nonce !== "string" ||
      payload.expiresAt <= now
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function setPendingInvitation(partyId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createPendingInvitationToken(partyId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function getPendingInvitationPartyId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyPendingInvitationToken(token)?.partyId ?? null;
}

export async function clearPendingInvitation(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
