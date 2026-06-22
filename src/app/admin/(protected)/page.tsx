import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { loadAdminDashboard } from "@/server/admin/operations";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const dashboard = await loadAdminDashboard();
  const metrics = [
    ["Total invited", dashboard?.totalInvited ?? 0],
    ["Responses", dashboard?.responses ?? 0],
    ["Attending", dashboard?.attending ?? 0],
    ["Declined", dashboard?.declined ?? 0],
    ["Pending", dashboard?.pending ?? 0],
    ["Assigned seats", dashboard?.assignedSeats ?? 0],
    ["Unassigned attendees", dashboard?.unassignedAttendees ?? 0],
    ["Checked in", dashboard?.checkedIn ?? 0],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <p className="text-sm text-zinc-600">
        {admin.displayName} · {admin.role}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Operations dashboard
      </h1>

      <dl className="mt-8 grid grid-cols-2 border-y border-zinc-200 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="border-b border-r border-zinc-200 p-4 last:border-r-0">
            <dt className="text-xs text-zinc-600">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <Link href="/admin/guests" className="border-t border-zinc-300 pt-4">
          <h2 className="font-semibold">Guest operations</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Parties, RSVP status, CSV, and passes.
          </p>
        </Link>
        <Link href="/admin/tables" className="border-t border-zinc-300 pt-4">
          <h2 className="font-semibold">Seating</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {dashboard?.activeTables ?? 0} active tables and capacity tracking.
          </p>
        </Link>
        <Link href="/admin/attendance" className="border-t border-zinc-300 pt-4">
          <h2 className="font-semibold">Event check-in</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Scanner, manual check-in, and reversals.
          </p>
        </Link>
      </section>

      {(dashboard?.failedEmails ?? 0) > 0 && (
        <p className="mt-8 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm">
          {dashboard?.failedEmails} recent email delivery record(s) failed.
        </p>
      )}
    </main>
  );
}
