import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { loadAdminDashboard } from "@/server/admin/operations";
import { Users, Grid2x2, TicketCheck, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const dashboard = await loadAdminDashboard();

  const metrics = [
    { label: "Total Invited",         value: dashboard?.totalInvited        ?? 0, accent: "#f0a8bc", bg: "rgba(240,168,188,0.12)" },
    { label: "Responses",             value: dashboard?.responses           ?? 0, accent: "#b5a0d5", bg: "rgba(181,160,213,0.12)" },
    { label: "Attending",             value: dashboard?.attending           ?? 0, accent: "#8fbc8b", bg: "rgba(143,188,139,0.12)" },
    { label: "Declined",              value: dashboard?.declined            ?? 0, accent: "#d4516e", bg: "rgba(212,81,110,0.12)"  },
    { label: "Pending",               value: dashboard?.pending             ?? 0, accent: "#f0c84a", bg: "rgba(240,200,74,0.12)"  },
    { label: "Assigned Seats",        value: dashboard?.assignedSeats       ?? 0, accent: "#90bfd8", bg: "rgba(144,191,216,0.12)" },
    { label: "Unassigned Attendees",  value: dashboard?.unassignedAttendees ?? 0, accent: "#c47b56", bg: "rgba(196,123,86,0.12)"  },
    { label: "Checked In",            value: dashboard?.checkedIn           ?? 0, accent: "#8fbc8b", bg: "rgba(143,188,139,0.12)" },
  ] as const;

  const quickLinks = [
    {
      href: "/admin/guests",
      icon: Users,
      title: "Guest Operations",
      desc: "Parties, RSVP status, CSV exports, and passes.",
      accent: "#f0a8bc",
      bg: "rgba(240,168,188,0.08)",
    },
    {
      href: "/admin/tables",
      icon: Grid2x2,
      title: "Seating",
      desc: `${dashboard?.activeTables ?? 0} active tables and capacity tracking.`,
      accent: "#b5a0d5",
      bg: "rgba(181,160,213,0.08)",
    },
    {
      href: "/admin/attendance",
      icon: TicketCheck,
      title: "Event Check-in",
      desc: "Scanner, manual check-in, and reversals.",
      accent: "#8fbc8b",
      bg: "rgba(143,188,139,0.08)",
    },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="text-sm text-muted-ink">
          Welcome back,{" "}
          <span className="font-medium text-rose">{admin.displayName}</span>
          {" · "}
          <span className="capitalize">{admin.role}</span>
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-wide text-ink">
          Operations Dashboard
        </h1>
        <div className="mt-2 h-px w-16" style={{ background: "linear-gradient(90deg, #e07898, transparent)" }} />
      </div>

      {/* ── Metrics grid ── */}
      <section aria-label="Key metrics">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map(({ label, value, accent, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: bg,
                border: `1px solid ${accent}40`,
                boxShadow: `0 2px 12px ${accent}18`,
              }}
            >
              <dt className="text-xs font-medium text-muted-ink">{label}</dt>
              <dd
                className="mt-1.5 font-display text-3xl font-semibold"
                style={{ color: accent === "#f0c84a" ? "#b48a17" : accent === "#8fbc8b" ? "#4a8a46" : accent }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Decorative divider ── */}
      <div className="my-10 flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.3)" }} />
        <span className="font-cursive text-2xl text-blush">✦ Quick Access ✦</span>
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.3)" }} />
      </div>

      {/* ── Quick links ── */}
      <section aria-label="Quick access links">
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map(({ href, icon: Icon, title, desc, accent, bg }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: bg,
                border: `1px solid ${accent}35`,
                boxShadow: `0 2px 10px ${accent}12`,
              }}
            >
              {/* Icon badge */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                  boxShadow: `0 4px 12px ${accent}40`,
                }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-0.5 text-sm text-muted-ink">{desc}</p>
              </div>
              {/* Hover accent bar */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                style={{ background: accent }}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Failed emails notice ── */}
      {(dashboard?.failedEmails ?? 0) > 0 && (
        <div
          className="mt-8 flex items-start gap-3 rounded-2xl p-4"
          style={{
            background: "rgba(240,168,188,0.12)",
            border: "1px solid rgba(212,81,110,0.25)",
          }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
          <p className="text-sm text-rose">
            <strong>{dashboard?.failedEmails}</strong> recent email delivery record(s) failed.
            Please review your email configuration.
          </p>
        </div>
      )}
    </div>
  );
}
