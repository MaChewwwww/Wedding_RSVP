import { requireAdmin } from "@/server/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeCsvCell } from "@/server/admin/csv";

export async function GET() {
  await requireAdmin();
  const db = createAdminClient();
  if (!db) return new Response("Backend not configured.", { status: 503 });
  const { data: inviteesData, error } = await db
    .from("invitees")
    .select(
      "id, full_name, rsvp_status, table_id, is_active, invitation_parties!inner(display_name, email, status), tables(name)"
    )
    .order("full_name", { ascending: true });

  if (error || !inviteesData) return new Response("Failed to load guests.", { status: 500 });

  const ids = inviteesData.map((i) => i.id);
  const { data: attData } = await db
    .from("invitee_attendance_current")
    .select("invitee_id, is_checked_in, last_event_at")
    .in("invitee_id", ids);

  const attMap = new Map();
  if (attData) {
    for (const att of attData) {
      attMap.set(att.invitee_id, att);
    }
  }

  const data = inviteesData.map((inv) => ({
    ...inv,
    invitee_attendance_current: attMap.get(inv.id) || null,
  }));

  const header = [
    "full_name",
    "email",
    "rsvp_status",
    "table",
    "checked_in",
    "last_event_at",
    "active",
  ];
  const rows = (data ?? []).map((row) => {
    const party = Array.isArray(row.invitation_parties)
      ? row.invitation_parties[0]
      : row.invitation_parties;
    const table = Array.isArray(row.tables) ? row.tables[0] : row.tables;
    const attendance = Array.isArray(row.invitee_attendance_current)
      ? row.invitee_attendance_current[0]
      : row.invitee_attendance_current;
    return [
      row.full_name,
      party?.email,
      row.rsvp_status,
      table?.name,
      attendance?.is_checked_in,
      attendance?.last_event_at,
      row.is_active,
    ];
  });
  const csv = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding-guests.csv"',
      "Cache-Control": "no-store",
    },
  });
}
