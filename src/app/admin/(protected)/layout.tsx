import Link from "next/link";
import { LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { requireAdmin } from "@/server/auth/admin";
import { signOutAction } from "./actions";
import { site } from "@/config/site";
import { AdminSidebarNav, AdminMobileNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "14px",
            fontFamily: "var(--font-sans)",
          },
        }}
      />


      {/* ══ Desktop Sidebar ══════════════════════════════════ */}
      <aside
        className="hidden w-64 flex-col md:flex"
        style={{
          background: "rgba(253,251,247,0.98)",
          borderRight: "1px solid rgba(240,168,188,0.22)",
          boxShadow: "2px 0 20px rgba(60,30,20,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-16 shrink-0 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid rgba(240,168,188,0.18)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #e07898, #d4516e)",
              boxShadow: "0 2px 10px rgba(212,81,110,0.3)",
            }}
          >
            <span className="font-cursive text-base leading-none">{site.couple.monogram}</span>
          </div>
          <div className="min-w-0">
            <Link
              href="/admin"
              className="block font-display text-lg font-semibold leading-tight text-ink transition-colors hover:text-rose"
            >
              Admin Portal
            </Link>
            <p className="truncate text-xs text-muted-ink">{site.couple.displayName}</p>
          </div>
        </div>

        {/* Client nav (active detection) */}
        <AdminSidebarNav displayName={admin.displayName} role={admin.role} />
      </aside>

      {/* ══ Mobile shell ════════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile header */}
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden"
          style={{
            background: "rgba(253,251,247,0.98)",
            borderBottom: "1px solid rgba(240,168,188,0.2)",
            boxShadow: "0 2px 10px rgba(60,30,20,0.05)",
          }}
        >
          <Link href="/admin" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #e07898, #d4516e)" }}
            >
              <span className="font-cursive text-sm">{site.couple.monogram}</span>
            </div>
            <span className="font-display text-base font-semibold text-ink">
              Admin Portal
            </span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-ink transition-colors hover:bg-blush-light hover:text-rose"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only">Sign out</span>
            </button>
          </form>
        </header>

        {/* Mobile scrollable nav tabs */}
        <nav
          aria-label="Mobile admin navigation"
          className="overflow-x-auto scrollbar-none md:hidden"
          style={{
            background: "rgba(253,251,247,0.95)",
            borderBottom: "1px solid rgba(240,168,188,0.18)",
          }}
        >
          <AdminMobileNav />
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "rgba(253,244,232,0.25)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
