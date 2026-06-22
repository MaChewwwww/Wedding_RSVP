import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Grid2x2, TicketCheck, Settings, ShieldAlert } from "lucide-react";
import { requireAdmin } from "@/server/auth/admin";
import { signOutAction } from "./actions";
import { site } from "@/config/site";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/tables", label: "Tables", icon: Grid2x2 },
  { href: "/admin/attendance", label: "Attendance", icon: TicketCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit", label: "Audit", icon: ShieldAlert },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200">
          <Link href="/admin" className="font-semibold text-lg">
            {site.couple.monogram} Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Admin navigation">
          <ul className="flex flex-col gap-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-zinc-200 p-4">
          <div className="mb-4 px-3 text-sm font-medium text-zinc-600 truncate">
            {admin.displayName}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 md:hidden">
          <Link href="/admin" className="font-semibold">
            {site.couple.monogram} Admin
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
              <LogOut className="h-5 w-5" aria-hidden />
              <span className="sr-only">Sign out</span>
            </button>
          </form>
        </header>

        {/* Mobile Navigation */}
        <nav
          aria-label="Mobile admin navigation"
          className="overflow-x-auto border-b border-zinc-200 bg-white md:hidden scrollbar-none"
        >
          <ul className="flex min-w-max px-3">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center gap-2 px-3 py-3 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
