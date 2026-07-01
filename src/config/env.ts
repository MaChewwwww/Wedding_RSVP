import { z } from "zod";

/*
  Centralized, validated environment access. Two hard rules from
  docs/security-and-privacy.md and docs/configuration.md:
    - Server-only secrets must never be read in client code or exposed via
      NEXT_PUBLIC_*. The `serverEnv` getter throws if called in the browser.
    - RSVP_DEADLINE is a server authorization rule. It must be a valid ISO 8601
      timestamp WITH an explicit UTC offset, and parsing fails loudly.

  In scaffold-only mode the live Supabase/Resend/Redis values are absent. We
  therefore parse leniently (most fields optional) so the app boots and the UI
  renders, while `isBackendConfigured()` lets server code show an explicit
  "backend not configured" state instead of crashing opaquely.
*/

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_EVENT_TIMEZONE: z.string().default("Asia/Manila"),
});

const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_EVENT_TIMEZONE: process.env.NEXT_PUBLIC_EVENT_TIMEZONE,
});

export const env = publicEnv;

/** True only when an explicit UTC offset (Z or ±HH:MM) is present. */
function hasExplicitOffset(value: string): boolean {
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value.trim());
}

const isoWithOffset = z
  .string()
  .refine((v) => hasExplicitOffset(v) && !Number.isNaN(Date.parse(v)), {
    message:
      "must be an ISO 8601 timestamp with an explicit UTC offset, e.g. 2026-07-10T23:59:59+08:00",
  });

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),
  GUEST_SESSION_SECRET: z.string().min(16).optional(),
  QR_TOKEN_PEPPER: z.string().min(16).optional(),
  QR_TOKEN_ENCRYPTION_KEY: z.string().min(43).optional(),

  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  RATE_LIMIT_REDIS_TOKEN: z.string().min(1).optional(),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().min(6).optional(),

  // Deadline is required in preview/production; default the documented value so
  // local scaffold-mode still boots with a sane, valid timestamp.
  RSVP_DEADLINE: isoWithOffset.default("2026-07-08T23:59:59+08:00"),

  WEDDING_DATE: z.string().optional(),
  NAME_MATCH_THRESHOLD: z.coerce.number().min(0).max(1).default(0.85),
  NAME_MATCH_MIN_GAP: z.coerce.number().min(0).max(1).default(0.08),
  GUEST_SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  ENABLE_EMAIL_DELIVERY: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_RSVP_UPDATES: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_CONTENT_ADMIN: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  CHECK_IN_MODE: z.literal("invitee").default("invitee"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

/** Server-only env accessor. Throws if imported into client code. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called in the browser.");
  }
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid server environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Whether a live Supabase backend is wired up (vs scaffold-only mode). */
export function isBackendConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.GUEST_SESSION_SECRET &&
      process.env.QR_TOKEN_PEPPER &&
      process.env.QR_TOKEN_ENCRYPTION_KEY,
  );
}
