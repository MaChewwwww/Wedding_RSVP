import Link from "next/link";
import { loadAttendanceRoster } from "@/server/admin/operations";
import { checkInAction, reverseCheckInAction } from "./actions";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, CheckCircle2, Clock } from "lucide-react";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const roster = await loadAttendanceRoster(search);

  const checkedInCount = roster.filter((r) => {
    const att = Array.isArray(r.invitee_attendance_current)
      ? r.invitee_attendance_current[0]
      : r.invitee_attendance_current;
    return att?.is_checked_in;
  }).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Attendance"
        subtitle="Manual check-in, QR scanner, and auditable reversals."
      >
        <Link href="/admin/attendance/scan">
          <Button variant="primary" size="default">
            <QrCode className="h-4 w-4" />
            Open QR Scanner
          </Button>
        </Link>
      </PageHeader>

      {/* ── Summary stat ── */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5"
          style={{
            background: "rgba(90,156,86,0.1)",
            border: "1px solid rgba(90,156,86,0.25)",
          }}
        >
          <CheckCircle2 className="h-4 w-4 text-sage-deep" aria-hidden />
          <span className="text-sm font-semibold text-sage-deep">
            {checkedInCount} checked in
          </span>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5"
          style={{
            background: "rgba(200,150,60,0.1)",
            border: "1px solid rgba(200,150,60,0.25)",
          }}
        >
          <Clock className="h-4 w-4 text-butter-deep" aria-hidden />
          <span className="text-sm font-semibold text-butter-deep">
            {roster.length - checkedInCount} pending
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <form className="mb-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60 pointer-events-none" aria-hidden />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search guest name…"
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="primary">Search</Button>
      </form>

      {/* ── Roster ── */}
      <div className="space-y-2">
        {roster.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-ink">
            No guests found.
          </p>
        )}
        {roster.map((row) => {
          const table = Array.isArray(row.tables) ? row.tables[0] : row.tables;
          const attendance = Array.isArray(row.invitee_attendance_current)
            ? row.invitee_attendance_current[0]
            : row.invitee_attendance_current;
          const checkedIn = attendance?.is_checked_in ?? false;

          return (
            <article
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-colors"
              style={{
                background: checkedIn
                  ? "rgba(90,156,86,0.06)"
                  : "rgba(253,251,247,0.9)",
                border: checkedIn
                  ? "1px solid rgba(90,156,86,0.2)"
                  : "1px solid rgba(240,168,188,0.18)",
              }}
            >
              {/* Info */}
              <div className="flex items-start gap-3">
                {/* Check-in indicator dot */}
                <div
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: checkedIn ? "#5a9c56" : "#f0a8bc" }}
                />
                <div>
                  <p className="font-semibold text-ink">{row.full_name}</p>
                  <p className="text-sm text-muted-ink">
                    {table?.name ?? "Unassigned table"} ·{" "}
                    <span className="capitalize">{row.rsvp_status}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-ink">
                    {checkedIn
                      ? `Checked in ${attendance?.last_event_at ?? ""}`
                      : "Not yet checked in"}
                  </p>
                </div>
              </div>

              {/* Status + action */}
              <div className="flex flex-wrap items-center gap-2">
                {checkedIn ? (
                  <>
                    <Badge variant="success">Checked in</Badge>
                    <form action={reverseCheckInAction} className="flex gap-2">
                      <input type="hidden" name="inviteeId" value={row.id} />
                      <Input
                        name="reason"
                        required
                        minLength={3}
                        placeholder="Reversal reason"
                        className="w-44 text-xs"
                      />
                      <Button type="submit" size="sm" variant="danger">
                        Reverse
                      </Button>
                    </form>
                  </>
                ) : (
                  <form action={checkInAction}>
                    <input type="hidden" name="inviteeId" value={row.id} />
                    <input type="hidden" name="method" value="manual" />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={row.rsvp_status !== "attending"}
                    >
                      Check in
                    </Button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
