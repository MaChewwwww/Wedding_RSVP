import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Grid2x2,
  TicketCheck,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { requireAdmin } from "@/server/auth/admin";
import { signOutAction } from "./actions";
import { site } from "@/config/site";

const adminLinks = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/guests",     label: "Guests",     icon: Users           },
  { href: "/admin/tables",     label: "Tables",     icon: Grid2x2         },
  { href: "/admin/attendance", label: "Attendance", icon: TicketCheck     },
  { href: "/admin/settings",   label: "Settings",   icon: Settings        },
  { href: "/admin/audit",      label: "Audit",      icon: ShieldAlert     },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden w-64 flex-col md:flex"
        style={{
          background: "rgba(253,251,247,0.97)",
          borderRight: "1px solid rgba(240,168,188,0.25)",
          boxShadow: "2px 0 16px rgba(60,30,20,0.05)",
        }}
      >
        {/* Logo area */}
        <div
          className="flex h-16 shrink-0 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid rgba(240,168,188,0.2)" }}
        >
          {/* Monogram badge */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #e07898, #d4516e)",
              boxShadow: "0 2px 8px rgba(212,81,110,0.3)",
            }}
          >
            <span className="font-cursive text-base leading-none">{site.couple.monogram}</span>
          </div>
          <div>
            <Link href="/admin" className="font-display text-lg font-semibold leading-tight text-ink hover:text-rose transition-colors">
              Admin Portal
            </Link>
            <p className="text-xs text-muted-ink leading-none">{site.couple.displayName}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          <ul className="flex flex-col gap-0.5">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-ink transition-all duration-150 hover:bg-blush-light hover:text-rose"
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-rose" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(240,168,188,0.2)" }}
        >
          {/* Admin info */}
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #b5a0d5, #8b70c0)" }}
            >
              {admin.displayName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{admin.displayName}</p>
              <p className="text-xs text-muted-ink capitalize">{admin.role}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-ink transition-all duration-150 hover:bg-blush-light hover:text-rose"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile shell ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header
          className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden"
          style={{
            background: "rgba(253,251,247,0.97)",
            borderBottom: "1px solid rgba(240,168,188,0.2)",
            boxShadow: "0 2px 8px rgba(60,30,20,0.04)",
          }}
        >
          <Link href="/admin" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #e07898, #d4516e)" }}
            >
              <span className="font-cursive text-sm">{site.couple.monogram}</span>
            </div>
            <span className="font-display text-base font-semibold text-ink">Admin Portal</span>
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

        {/* Mobile Navigation tabs */}
        <nav
          aria-label="Mobile admin navigation"
          className="overflow-x-auto md:hidden scrollbar-none"
          style={{
            background: "rgba(253,251,247,0.95)",
            borderBottom: "1px solid rgba(240,168,188,0.2)",
          }}
        >
          <ul className="flex min-w-max px-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center gap-1.5 px-3 py-3 text-xs font-medium text-muted-ink transition-colors hover:text-rose"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-paper-2/40">
          {children}
        </main>
      </div>
    </div>
  );
}
