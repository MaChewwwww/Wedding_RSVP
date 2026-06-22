import Link from "next/link";
import { loadAttendanceRoster } from "@/server/admin/operations";
import { checkInAction, reverseCheckInAction } from "./actions";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const roster = await loadAttendanceRoster(search);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Attendance</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manual check-in and auditable reversals.
          </p>
        </div>
        <Link
          href="/admin/attendance/scan"
          className="inline-flex min-h-11 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white"
        >
          Open QR scanner
        </Link>
      </div>

      <form className="mt-6 flex max-w-md gap-2">
        <input name="q" defaultValue={search} placeholder="Search guest name" className="min-h-11 flex-1 rounded-md border border-zinc-300 bg-white px-3" />
        <button className="rounded-md border border-zinc-300 px-4">Search</button>
      </form>

      <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
        {roster.map((row) => {
          const table = Array.isArray(row.tables) ? row.tables[0] : row.tables;
          const attendance = Array.isArray(row.invitee_attendance_current)
            ? row.invitee_attendance_current[0]
            : row.invitee_attendance_current;
          const checkedIn = attendance?.is_checked_in ?? false;
          return (
            <article
              key={row.id}
              className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="font-medium">{row.full_name}</p>
                <p className="text-sm text-zinc-600">
                  {table?.name ?? "Unassigned"} · {row.rsvp_status}
                </p>
                <p className="text-xs text-zinc-500">
                  {checkedIn
                    ? `Checked in ${attendance?.last_event_at ?? ""}`
                    : "Not checked in"}
                </p>
              </div>
              {checkedIn ? (
                <form action={reverseCheckInAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="inviteeId" value={row.id} />
                  <input name="reason" required minLength={3} placeholder="Reversal reason" className="min-h-11 rounded-md border border-zinc-300 px-3" />
                  <button className="min-h-11 rounded-md border border-red-300 px-3 text-sm text-red-700">
                    Reverse
                  </button>
                </form>
              ) : (
                <form action={checkInAction}>
                  <input type="hidden" name="inviteeId" value={row.id} />
                  <input type="hidden" name="method" value="manual" />
                  <button
                    disabled={row.rsvp_status !== "attending"}
                    className="min-h-11 rounded-md bg-zinc-900 px-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Check in
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
