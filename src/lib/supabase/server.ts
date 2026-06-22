import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/config/env";

/*
  SSR Supabase client bound to the request cookie store. Used in Server
  Components, Server Actions, and route handlers for admin auth sessions.

  Next.js 16: cookies() is async and must be awaited. Returns null in
  scaffold-only mode (no live Supabase env).
*/
export async function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll can be called from a Server Component render, where
            // mutating cookies is disallowed. Safe to ignore when middleware
            // (proxy) refreshes the session.
          }
        },
      },
    },
  );
}
