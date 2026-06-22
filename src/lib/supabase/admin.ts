import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/*
  Service-role Supabase client. Bypasses RLS — used narrowly by server-only
  domain code (matching, RSVP transaction, QR, admin mutations). The
  "server-only" import guarantees a build error if this is ever pulled into a
  client bundle, satisfying the docs/security-and-privacy.md requirement that
  the service-role key never reaches the browser.

  Returns null in scaffold-only mode so callers surface an explicit
  "backend not configured" state rather than throwing opaquely.
*/
export function createAdminClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
