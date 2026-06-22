import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";

/*
  Browser (anon) Supabase client. Only the anon key — which is safe to expose —
  is used here. RLS (docs/security-and-privacy.md) is the real boundary: anon
  users get no direct select access to guest/RSVP/QR/seating/attendance tables.
  Guest data flows through server actions, not this client.

  Returns null in scaffold-only mode so callers can branch on configuration.
*/
export function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
