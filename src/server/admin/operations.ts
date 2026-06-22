import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loadAdminDashboard() {
  const db = createAdminClient();
  if (!db) return null;

  const [
    parties,
    invitees,
    tables,
    attendance,
    emails,
  ] = await Promise.all([
    db.from("invitation_parties").select("id, rsvp_status, status"),
    db.from("invitees").select("id, rsvp_status, table_id, is_active"),
    db.from("tables").select("id, capacity, is_active"),
    db.from("invitee_attendance_current").select("invitee_id, is_checked_in"),
    db.from("email_deliveries").select("id, status").order("created_at", {
      ascending: false,
    }).limit(20),
  ]);

  const activeParties = (parties.data ?? []).filter((p) => p.status === "active");
  const activeInvitees = (invitees.data ?? []).filter((i) => i.is_active);
  return {
    totalInvited: activeInvitees.length,
    responses: activeParties.filter((p) => p.rsvp_status !== "pending").length,
    attending: activeInvitees.filter((i) => i.rsvp_status === "attending").length,
    declined: activeInvitees.filter((i) => i.rsvp_status === "declined").length,
    pending: activeInvitees.filter((i) => i.rsvp_status === "pending").length,
    assignedSeats: activeInvitees.filter(
      (i) => i.rsvp_status === "attending" && i.table_id,
    ).length,
    unassignedAttendees: activeInvitees.filter(
      (i) => i.rsvp_status === "attending" && !i.table_id,
    ).length,
    checkedIn: (attendance.data ?? []).filter((a) => a.is_checked_in).length,
    activeTables: (tables.data ?? []).filter((t) => t.is_active).length,
    failedEmails: (emails.data ?? []).filter((e) => e.status === "failed").length,
  };
}

export async function loadGuestAdminData(search?: string) {
  const db = createAdminClient();
  if (!db) return [];

  let query = db
    .from("invitation_parties")
    .select(
      "id, display_name, status, rsvp_status, email, invitees(id, full_name, normalized_name, rsvp_status, table_id, is_active), qr_passes(id, invitee_id, status)",
    )
    .order("display_name", { ascending: true });
  if (search?.trim()) query = query.ilike("display_name", `%${search.trim()}%`);
  const { data } = await query;
  return data ?? [];
}

export async function loadTableAdminData() {
  const db = createAdminClient();
  if (!db) return { tables: [], attendees: [] };
  const [tables, attendees] = await Promise.all([
    db
      .from("table_capacity")
      .select("table_id, name, capacity, assigned, remaining, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    db
      .from("invitees")
      .select("id, full_name, table_id")
      .eq("rsvp_status", "attending")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
  ]);
  return { tables: tables.data ?? [], attendees: attendees.data ?? [] };
}

export async function loadAttendanceRoster(search?: string) {
  const db = createAdminClient();
  if (!db) return [];
  let query = db
    .from("invitees")
    .select(
      "id, full_name, rsvp_status, is_active, tables(name), invitee_attendance_current(is_checked_in, last_event_at)",
    )
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (search?.trim()) query = query.ilike("full_name", `%${search.trim()}%`);
  const { data } = await query.limit(100);
  return data ?? [];
}
