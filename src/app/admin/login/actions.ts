"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isBackendConfigured } from "@/config/env";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/*
  Admin login (docs/security-and-privacy.md "Admin authentication"). Email +
  password via Supabase Auth, rate-limited by hashed IP to slow brute force. No
  public sign-up. On success the SSR client sets the session cookie; the proxy
  and per-route guard enforce access thereafter.
*/

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "rate_limited" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isBackendConfigured()) return { status: "unconfigured" };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const clientId = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const rl = rateLimit(`adminLogin:${clientId}`, RATE_LIMITS.adminLogin);
  if (!rl.success) return { status: "rate_limited" };

  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    logger.warn("admin_login_failed", {});
    // Generic message — do not reveal whether the email exists.
    return { status: "error", message: "Invalid email or password." };
  }

  return { status: "success" };
}
