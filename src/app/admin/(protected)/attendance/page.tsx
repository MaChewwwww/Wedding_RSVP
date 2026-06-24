import { loadAttendanceRoster } from "@/server/admin/operations";
import { PageHeader } from "@/components/admin/page-header";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const roster = await loadAttendanceRoster(search);

  const rows = roster.map((r) => {
    const table = Array.isArray(r.tables) ? r.tables[0] : r.tables;
    const att = Array.isArray(r.invitee_attendance_current)
      ? r.invitee_attendance_current[0]
      : r.invitee_attendance_current;
    return {
      id: r.id,
      full_name: r.full_name,
      rsvp_status: r.rsvp_status,
      tableName: table?.name ?? null,
      checkedIn: att?.is_checked_in ?? false,
      lastEventAt: att?.last_event_at ?? null,
    };
  });

  const checkedInCount = rows.filter((r) => r.checkedIn).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Attendance"
        subtitle="Check in any guest — by QR, by upload, or manually for non-techy guests."
      />
      <AttendanceClient
        rows={rows}
        search={search}
        checkedInCount={checkedInCount}
      />
    </div>
  );
}
