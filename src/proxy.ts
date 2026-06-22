import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/config/env";

/*
  Next.js 16 renamed `middleware` to `proxy` (nodejs runtime). This refreshes
  the Supabase auth session cookie on admin routes and performs a coarse guard:
  unauthenticated requests to /admin/* (except the login page) are redirected to
  /admin/login. The authoritative check still happens server-side in each
  protected page/action (docs/security-and-privacy.md: do not rely on route
  guards alone). In scaffold-only mode (no Supabase env) it is a no-op pass.
*/
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminArea && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
