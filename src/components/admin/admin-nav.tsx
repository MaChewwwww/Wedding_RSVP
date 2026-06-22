"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Grid2x2,
  TicketCheck,
  Settings,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/admin/(protected)/actions";
import { site } from "@/config/site";

const adminLinks = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/guests",     label: "Guests",     icon: Users           },
  { href: "/admin/tables",     label: "Tables",     icon: Grid2x2         },
  { href: "/admin/attendance", label: "Attendance", icon: TicketCheck     },
  { href: "/admin/settings",   label: "Settings",   icon: Settings        },
  { href: "/admin/audit",      label: "Audit",      icon: ShieldAlert     },
] as const;

/* ── Shared link style helper ─── */
function navLinkClass(active: boolean) {
  return cn(
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
    active
      ? "bg-blush-light text-rose"
      : "text-muted-ink hover:bg-blush-light/60 hover:text-rose",
  );
}

/* ── Desktop sidebar nav ─── */
export function AdminSidebarNav({
  displayName,
  role,
}: {
  displayName: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <ul className="flex flex-col gap-0.5">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} className={navLinkClass(active)}>
                  {active && (
                    <span
                      className="absolute left-0 h-6 w-0.5 rounded-r"
                      style={{ background: "#e07898" }}
                      aria-hidden
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-rose" : "text-muted-ink group-hover:text-rose",
                    )}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(240,168,188,0.2)" }}>
        <div className="mb-3 flex items-center gap-2.5 px-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #b5a0d5, #8b70c0)" }}
          >
            {displayName?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{displayName}</p>
            <p className="text-xs capitalize text-muted-ink">{role}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-ink transition-all duration-150 hover:bg-blush-light/60 hover:text-rose"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

/* ── Mobile tab nav ─── */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <ul className="flex min-w-max px-2">
      {adminLinks.map((link) => {
        const Icon = link.icon;
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "flex min-h-11 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                active
                  ? "border-rose text-rose"
                  : "border-transparent text-muted-ink hover:text-rose",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Mobile header logo ─── */
export function AdminMobileHeader({ displayName }: { displayName: string }) {
  const _ = displayName; // consumed by parent
  return null; // rendered via parent — exported for reuse if needed
}

export { adminLinks };
