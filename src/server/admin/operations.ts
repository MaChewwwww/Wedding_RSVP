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
  const activeTables = (tables.data ?? []).filter((t) => t.is_active);
  const attending = activeInvitees.filter((i) => i.rsvp_status === "attending").length;
  const declined = activeInvitees.filter((i) => i.rsvp_status === "declined").length;
  const pending = activeInvitees.filter((i) => i.rsvp_status === "pending").length;
  const checkedIn = (attendance.data ?? []).filter((a) => a.is_checked_in).length;
  const seatingCapacity = activeTables.reduce((sum, t) => sum + (t.capacity ?? 0), 0);
  const seatedGuests = activeInvitees.filter((i) => i.table_id).length;

  return {
    totalInvited: activeInvitees.length,
    responses: activeParties.filter((p) => p.rsvp_status !== "pending").length,
    attending,
    declined,
    pending,
    assignedSeats: activeInvitees.filter(
      (i) => i.rsvp_status === "attending" && i.table_id,
    ).length,
    unassignedAttendees: activeInvitees.filter(
      (i) => i.rsvp_status === "attending" && !i.table_id,
    ).length,
    checkedIn,
    activeTables: activeTables.length,
    failedEmails: (emails.data ?? []).filter((e) => e.status === "failed").length,
    // Chart series.
    rsvpBreakdown: [
      { name: "Attending", value: attending, color: "#5a9c56" },
      { name: "Not attending", value: declined, color: "#d4516e" },
      { name: "Undecided", value: pending, color: "#c8963c" },
    ],
    seating: {
      capacity: seatingCapacity,
      seated: seatedGuests,
      unseated: Math.max(seatingCapacity - seatedGuests, 0),
    },
    checkIn: {
      checkedIn,
      expected: attending,
      remaining: Math.max(attending - checkedIn, 0),
    },
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
  if (!db) return { tables: [], guests: [] };
  const [tables, guests] = await Promise.all([
    db
      .from("table_capacity")
      .select("table_id, name, capacity, assigned, remaining, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    db
      .from("invitees")
      .select("id, full_name, rsvp_status, table_id")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
  ]);
  // table_capacity is a view; pull location_note from the base table separately.
  const { data: meta } = await db
    .from("tables")
    .select("id, location_note")
    .eq("is_active", true);
  const locationById = new Map(
    (meta ?? []).map((t) => [t.id, t.location_note as string | null]),
  );
  const tablesWithLocation = (tables.data ?? []).map((t) => ({
    ...t,
    location_note: locationById.get(t.table_id) ?? null,
  }));
  return { tables: tablesWithLocation, guests: guests.data ?? [] };
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
  const { data } = await query.limit(1000);
  return data ?? [];
}

export type AuditRow = {
  id: string;
  createdAt: string;
  actorName: string;
  actionLabel: string;
  actionKind:
    | "create"
    | "delete"
    | "rsvp"
    | "pass"
    | "table"
    | "seating"
    | "checkin"
    | "other";
  subject: string;
  detail: string | null;
};

const ACTION_META: Record<
  string,
  { label: string; kind: AuditRow["actionKind"] }
> = {
  "party.create": { label: "Created guest", kind: "create" },
  "party.csv_import": { label: "Imported guests", kind: "create" },
  "party.archive": { label: "Archived guest", kind: "delete" },
  "guest.delete": { label: "Deleted guest", kind: "delete" },
  "rsvp.admin_override": { label: "Changed RSVP status", kind: "rsvp" },
  "rsvp.submit": { label: "Guest submitted RSVP", kind: "rsvp" },
  "qr.revoke": { label: "Revoked pass", kind: "pass" },
  "qr.reissue": { label: "Reissued pass", kind: "pass" },
  "table.create": { label: "Created table", kind: "table" },
  "table.update": { label: "Edited table", kind: "table" },
  "table.delete": { label: "Deleted table", kind: "delete" },
  "table.archive": { label: "Archived table", kind: "delete" },
  "invitee.table_assign": { label: "Assigned seating", kind: "seating" },
  check_in_reversed: { label: "Reversed check-in", kind: "checkin" },
  checked_in: { label: "Checked in", kind: "checkin" },
};

const RSVP_LABELS: Record<string, string> = {
  attending: "Attending",
  declined: "Not attending",
  pending: "Undecided",
  undecided: "Undecided",
};

function asString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return String(value);
}

export async function loadAuditLog(limit = 200): Promise<AuditRow[]> {
  const db = createAdminClient();
  if (!db) return [];

  const { data: rows } = await db
    .from("audit_logs")
    .select(
      'id, actor_user_id, action, entity_type, entity_id, before, after, created_at',
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!rows || rows.length === 0) return [];

  // Resolve actor display names and entity (guest/table) names in batches.
  const actorIds = [
    ...new Set(rows.map((r) => r.actor_user_id).filter(Boolean) as string[]),
  ];
  const partyIds = [
    ...new Set(
      rows
        .filter((r) => r.entity_type === "invitation_party")
        .map((r) => r.entity_id)
        .filter(Boolean) as string[],
    ),
  ];
  const inviteeIds = [
    ...new Set(
      rows
        .filter((r) => r.entity_type === "invitee")
        .map((r) => r.entity_id)
        .filter(Boolean) as string[],
    ),
  ];
  const tableIds = [
    ...new Set(
      rows
        .filter((r) => r.entity_type === "table")
        .map((r) => r.entity_id)
        .filter(Boolean) as string[],
    ),
  ];

  const [actors, parties, invitees, tables] = await Promise.all([
    actorIds.length
      ? db.from("admin_profiles").select("user_id, display_name").in("user_id", actorIds)
      : Promise.resolve({ data: [] as { user_id: string; display_name: string }[] }),
    partyIds.length
      ? db.from("invitation_parties").select("id, display_name").in("id", partyIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
    inviteeIds.length
      ? db.from("invitees").select("id, full_name").in("id", inviteeIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    tableIds.length
      ? db.from("tables").select("id, name").in("id", tableIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const actorName = new Map(
    (actors.data ?? []).map((a) => [a.user_id, a.display_name]),
  );
  const partyName = new Map(
    (parties.data ?? []).map((p) => [p.id, p.display_name]),
  );
  const inviteeName = new Map(
    (invitees.data ?? []).map((i) => [i.id, i.full_name]),
  );
  const tableName = new Map((tables.data ?? []).map((t) => [t.id, t.name]));

  return rows.map((r) => {
    const meta = ACTION_META[r.action] ?? {
      label: r.action,
      kind: "other" as const,
    };
    const before = (r.before ?? {}) as Record<string, unknown>;
    const after = (r.after ?? {}) as Record<string, unknown>;

    // Subject name — prefer resolved entity, fall back to names in before/after.
    let subject = "—";
    if (r.entity_type === "invitation_party") {
      subject = partyName.get(r.entity_id) ?? asString(before.full_name) ?? "Deleted guest";
    } else if (r.entity_type === "invitee") {
      subject = inviteeName.get(r.entity_id) ?? "Guest";
    } else if (r.entity_type === "table") {
      subject =
        tableName.get(r.entity_id) ??
        asString(after.name) ??
        asString(before.name) ??
        "Deleted table";
    }

    // Human-readable detail.
    let detail: string | null = null;
    if (r.action === "rsvp.admin_override") {
      const to = asString(after.rsvp_status);
      const reason = asString(after.reason);
      detail = `→ ${to ? RSVP_LABELS[to] ?? to : "?"}${reason ? ` · ${reason}` : ""}`;
    } else if (r.action === "party.csv_import") {
      const n = asString(after.parties_created);
      detail = n ? `${n} guest${n === "1" ? "" : "s"} added` : null;
    } else if (r.action === "table.create" || r.action === "table.update") {
      const cap = asString(after.capacity);
      detail = cap ? `Capacity ${cap}` : null;
    }

    return {
      id: r.id,
      createdAt: r.created_at,
      actorName: r.actor_user_id
        ? actorName.get(r.actor_user_id) ?? "Admin"
        : "System",
      actionLabel: meta.label,
      actionKind: meta.kind,
      subject,
      detail,
    };
  });
}
