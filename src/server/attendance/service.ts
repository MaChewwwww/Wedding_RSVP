import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/server/qr/token";

export type AttendanceSubject = {
  inviteeId: string;
  fullName: string;
  tableName: string | null;
  rsvpStatus: string;
  isCheckedIn: boolean;
  lastEventAt: string | null;
};

export async function resolveQrSubject(
  rawToken: string,
): Promise<AttendanceSubject | null> {
  const db = createAdminClient();
  if (!db) return null;

  const { data: pass } = await db
    .from("qr_passes")
    .select("invitee_id, status")
    .eq("token_hash", hashToken(rawToken))
    .single();
  if (!pass || pass.status !== "active" || !pass.invitee_id) return null;
  return loadAttendanceSubject(pass.invitee_id);
}

export async function loadAttendanceSubject(
  inviteeId: string,
): Promise<AttendanceSubject | null> {
  const db = createAdminClient();
  if (!db) return null;

  const { data: invitee } = await db
    .from("invitees")
    .select(
      "id, full_name, rsvp_status, tables(name)",
    )
    .eq("id", inviteeId)
    .eq("is_active", true)
    .single();
  if (!invitee) return null;

  const { data: state } = await db
    .from("invitee_attendance_current")
    .select("is_checked_in, last_event_at")
    .eq("invitee_id", inviteeId)
    .single();

  const table = Array.isArray(invitee.tables)
    ? invitee.tables[0]
    : invitee.tables;

  return {
    inviteeId: invitee.id,
    fullName: invitee.full_name,
    tableName: table?.name ?? null,
    rsvpStatus: invitee.rsvp_status,
    isCheckedIn: state?.is_checked_in ?? false,
    lastEventAt: state?.last_event_at ?? null,
  };
}

export async function recordAttendance(args: {
  inviteeId: string;
  eventType: "checked_in" | "check_in_reversed";
  method: "qr" | "manual";
  adminUserId: string;
  reason?: string;
  requestId?: string;
  deviceMeta?: Record<string, unknown>;
}): Promise<{ result: string; occurredAt: string | null }> {
  const db = createAdminClient();
  if (!db) throw new Error("Backend not configured.");

  const { data, error } = await db.rpc("record_attendance", {
    p_invitee_id: args.inviteeId,
    p_event_type: args.eventType,
    p_method: args.method,
    p_performed_by: args.adminUserId,
    p_request_id: args.requestId ?? randomUUID(),
    p_reason: args.reason ?? null,
    p_device_meta: args.deviceMeta ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    result: row?.result ?? "unknown",
    occurredAt: row?.occurred_at ?? null,
  };
}
