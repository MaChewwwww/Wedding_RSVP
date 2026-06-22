import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { loadAdminDashboard } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { Users, Grid2x2, TicketCheck, AlertTriangle, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const dashboard = await loadAdminDashboard();

  const metrics = [
    { label: "Total Invited",        value: dashboard?.totalInvited        ?? 0, accent: "#e07898", bg: "rgba(224,120,152,0.1)",  border: "rgba(224,120,152,0.25)" },
    { label: "Responses Received",   value: dashboard?.responses           ?? 0, accent: "#b5a0d5", bg: "rgba(181,160,213,0.1)", border: "rgba(181,160,213,0.25)" },
    { label: "Attending",            value: dashboard?.attending           ?? 0, accent: "#5a9c56", bg: "rgba(90,156,86,0.1)",   border: "rgba(90,156,86,0.25)"  },
    { label: "Declined",             value: dashboard?.declined            ?? 0, accent: "#d4516e", bg: "rgba(212,81,110,0.1)",  border: "rgba(212,81,110,0.25)" },
    { label: "Awaiting Response",    value: dashboard?.pending             ?? 0, accent: "#c8963c", bg: "rgba(200,150,60,0.1)",  border: "rgba(200,150,60,0.25)" },
    { label: "Seats Assigned",       value: dashboard?.assignedSeats       ?? 0, accent: "#5aa8c8", bg: "rgba(90,168,200,0.1)",  border: "rgba(90,168,200,0.25)" },
    { label: "Unassigned Attendees", value: dashboard?.unassignedAttendees ?? 0, accent: "#c47b56", bg: "rgba(196,123,86,0.1)",  border: "rgba(196,123,86,0.25)" },
    { label: "Checked In",           value: dashboard?.checkedIn           ?? 0, accent: "#5a9c56", bg: "rgba(90,156,86,0.1)",   border: "rgba(90,156,86,0.25)"  },
  ] as const;

  const quickLinks = [
    {
      href: "/admin/guests",
      icon: Users,
      title: "Guest Operations",
      desc: "Parties, RSVP status, CSV exports, and passes.",
      accent: "#e07898",
      bg: "rgba(224,120,152,0.07)",
    },
    {
      href: "/admin/tables",
      icon: Grid2x2,
      title: "Seating",
      desc: `${dashboard?.activeTables ?? 0} active tables — assign and track capacity.`,
      accent: "#b5a0d5",
      bg: "rgba(181,160,213,0.07)",
    },
    {
      href: "/admin/attendance",
      icon: TicketCheck,
      title: "Event Check-in",
      desc: "QR scanner, manual check-in, and reversals.",
      accent: "#5a9c56",
      bg: "rgba(90,156,86,0.07)",
    },
  ] as const;

  const responseRate =
    (dashboard?.totalInvited ?? 0) > 0
      ? Math.round(((dashboard?.responses ?? 0) / (dashboard?.totalInvited ?? 1)) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">

      <PageHeader
        title="Operations Dashboard"
        subtitle={`Welcome back, ${admin.displayName} · ${admin.role}`}
      />

      {/* ── Response rate bar ── */}
      <div
        className="mb-8 rounded-2xl p-5"
        style={{
          background: "rgba(253,232,240,0.4)",
          border: "1px solid rgba(240,168,188,0.25)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose" aria-hidden />
            <span className="text-sm font-semibold text-ink">Response rate</span>
          </div>
          <span className="font-display text-2xl font-semibold text-rose">{responseRate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-blush-light">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${responseRate}%`,
              background: "linear-gradient(90deg, #e07898, #d4516e)",
            }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-ink">
          {dashboard?.responses ?? 0} of {dashboard?.totalInvited ?? 0} guests have responded
        </p>
      </div>

      {/* ── Metrics grid ── */}
      <section aria-label="Key metrics" className="mb-10">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map(({ label, value, accent, bg, border }) => (
            <div
              key={label}
              className="rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: bg, border: `1px solid ${border}`, boxShadow: `0 2px 10px ${accent}15` }}
            >
              <dt className="text-xs font-medium text-muted-ink">{label}</dt>
              <dd className="mt-1.5 font-display text-3xl font-semibold" style={{ color: accent }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Divider ── */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.25)" }} />
        <span className="font-cursive text-xl text-blush-deep">Quick Access</span>
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.25)" }} />
      </div>

      {/* ── Quick links ── */}
      <section aria-label="Quick access" className="grid gap-4 md:grid-cols-3">
        {quickLinks.map(({ href, icon: Icon, title, desc, accent, bg }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{ background: bg, border: `1px solid ${accent}30`, boxShadow: `0 2px 8px ${accent}12` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform duration-200 group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, boxShadow: `0 4px 12px ${accent}35` }}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-0.5 text-sm text-muted-ink">{desc}</p>
            </div>
            <div
              className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
              style={{ background: accent }}
            />
          </Link>
        ))}
      </section>

      {/* ── Failed emails ── */}
      {(dashboard?.failedEmails ?? 0) > 0 && (
        <div
          className="mt-8 flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "rgba(212,81,110,0.08)", border: "1px solid rgba(212,81,110,0.2)" }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
          <p className="text-sm text-rose">
            <strong>{dashboard?.failedEmails}</strong> recent email delivery record(s) failed.
            Review your email configuration.
          </p>
        </div>
      )}
    </div>
  );
}
