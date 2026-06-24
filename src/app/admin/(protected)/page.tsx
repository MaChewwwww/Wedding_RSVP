import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { loadAdminDashboard } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { RsvpDonut, SimpleBar } from "./dashboard-charts";
import {
  Users,
  Grid2x2,
  TicketCheck,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  HelpCircle,
  Armchair,
  ScanLine,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const d = await loadAdminDashboard();

  const metrics = [
    { label: "Total Invited", value: d?.totalInvited ?? 0, icon: Users, accent: "#e07898" },
    { label: "Attending", value: d?.attending ?? 0, icon: UserCheck, accent: "#5a9c56" },
    { label: "Not Attending", value: d?.declined ?? 0, icon: UserX, accent: "#d4516e" },
    { label: "Undecided", value: d?.pending ?? 0, icon: HelpCircle, accent: "#c8963c" },
    { label: "Seats Assigned", value: d?.assignedSeats ?? 0, icon: Armchair, accent: "#5aa8c8" },
    { label: "Checked In", value: d?.checkedIn ?? 0, icon: ScanLine, accent: "#8b70c0" },
  ] as const;

  const quickLinks = [
    { href: "/admin/guests", icon: Users, title: "Guests", desc: "Add, edit RSVP, manage passes.", accent: "#e07898" },
    { href: "/admin/tables", icon: Grid2x2, title: "Seating", desc: `${d?.activeTables ?? 0} tables — assign and track.`, accent: "#b5a0d5" },
    { href: "/admin/attendance", icon: TicketCheck, title: "Check-in", desc: "QR scan, upload, or manual.", accent: "#5a9c56" },
  ] as const;

  const responseRate =
    (d?.totalInvited ?? 0) > 0
      ? Math.round(((d?.responses ?? 0) / (d?.totalInvited ?? 1)) * 100)
      : 0;

  const seatingBars = [
    { name: "Seated", value: d?.seating.seated ?? 0, color: "#5a9c56" },
    { name: "Open seats", value: d?.seating.unseated ?? 0, color: "#f0a8bc" },
  ];
  const checkInBars = [
    { name: "Checked in", value: d?.checkIn.checkedIn ?? 0, color: "#5a9c56" },
    { name: "Remaining", value: d?.checkIn.remaining ?? 0, color: "#c8963c" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${admin.displayName} · ${admin.role}`}
      />

      {/* Response rate */}
      <div
        className="mb-8 rounded-2xl p-5"
        style={{
          background: "rgba(253,232,240,0.4)",
          border: "1px solid rgba(240,168,188,0.25)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose" aria-hidden />
            <span className="text-sm font-semibold text-ink">Response rate</span>
          </div>
          <span className="font-display text-2xl font-semibold text-rose">
            {responseRate}%
          </span>
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
          {d?.responses ?? 0} of {d?.totalInvited ?? 0} guests have responded
        </p>
      </div>

      {/* KPI cards */}
      <section aria-label="Key metrics" className="mb-8">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map(({ label, value, icon: Icon, accent }) => (
            <Card key={label} className="p-4">
              <div
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${accent}1a`, color: accent }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <dt className="text-xs font-medium text-muted-ink">{label}</dt>
              <dd
                className="mt-0.5 font-display text-3xl font-semibold"
                style={{ color: accent }}
              >
                {value}
              </dd>
            </Card>
          ))}
        </dl>
      </section>

      {/* Charts */}
      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            RSVP breakdown
          </h2>
          <RsvpDonut data={d?.rsvpBreakdown ?? []} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Seating
          </h2>
          <SimpleBar data={seatingBars} />
          <p className="mt-2 text-center text-xs text-muted-ink">
            {d?.seating.seated ?? 0} seated · {d?.seating.capacity ?? 0} total seats
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">
            Check-in progress
          </h2>
          <SimpleBar data={checkInBars} />
          <p className="mt-2 text-center text-xs text-muted-ink">
            {d?.checkIn.checkedIn ?? 0} of {d?.checkIn.expected ?? 0} attending guests in
          </p>
        </Card>
      </section>

      {/* Quick links */}
      <section aria-label="Quick access" className="grid gap-4 md:grid-cols-3">
        {quickLinks.map(({ href, icon: Icon, title, desc, accent }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-200 group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm text-muted-ink">{desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Failed emails */}
      {(d?.failedEmails ?? 0) > 0 && (
        <div
          className="mt-8 flex items-start gap-3 rounded-2xl p-4"
          style={{
            background: "rgba(212,81,110,0.08)",
            border: "1px solid rgba(212,81,110,0.2)",
          }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
          <p className="text-sm text-rose">
            <strong>{d?.failedEmails}</strong> recent email delivery record(s)
            failed. Review your email configuration.
          </p>
        </div>
      )}
    </div>
  );
}
