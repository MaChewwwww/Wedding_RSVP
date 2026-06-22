import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isBackendConfigured } from "@/config/env";

/*
  Authoritative admin authorization (docs/security-and-privacy.md): validate the
  session AND an active admin profile on every protected route and mutation —
  not just the proxy route guard. Use in Server Components and Server Actions.
*/

export type AdminContext = {
  userId: string;
  role: "admin" | "check_in_staff";
  displayName: string;
};

/**
 * Returns the active admin context, or null if unauthenticated / not an active
 * admin / backend not configured. Never throws.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  if (!isBackendConfigured()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Read the profile with the service role to avoid RLS recursion concerns.
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("admin_profiles")
    .select("role, display_name, is_active")
    .eq("user_id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    userId: user.id,
    role: profile.role,
    displayName: profile.display_name,
  };
}

/** Guard for protected pages: redirects to login when not an active admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}
