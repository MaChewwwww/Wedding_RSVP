"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createTableAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(80),
      capacity: z.coerce.number().int().min(1).max(100),
      locationNote: z.string().trim().max(200).optional(),
    })
    .parse({
      name: formData.get("name"),
      capacity: formData.get("capacity"),
      locationNote: formData.get("locationNote") || undefined,
    });
  const db = createAdminClient();
  if (!db) return;
  const { data } = await db
    .from("tables")
    .insert({
      name: parsed.name,
      capacity: parsed.capacity,
      location_note: parsed.locationNote || null,
    })
    .select("id")
    .single();
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "table.create",
    entity_type: "table",
    entity_id: data?.id,
    after: { name: parsed.name, capacity: parsed.capacity },
  });
  revalidatePath("/admin/tables");
}

export async function assignTableAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const inviteeId = z.string().uuid().parse(formData.get("inviteeId"));
  const tableValue = z.string().parse(formData.get("tableId"));
  const tableId = tableValue === "unassigned"
    ? null
    : z.string().uuid().parse(tableValue);
  const db = createAdminClient();
  if (!db) return;
  const { error } = await db
    .from("invitees")
    .update({ table_id: tableId })
    .eq("id", inviteeId)
    .eq("rsvp_status", "attending");
  if (error) throw new Error(error.message);
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "invitee.table_assign",
    entity_type: "invitee",
    entity_id: inviteeId,
    after: { table_id: tableId },
  });
  revalidatePath("/admin/tables");
}

export async function archiveTableAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const tableId = z.string().uuid().parse(formData.get("tableId"));
  const db = createAdminClient();
  if (!db) return;
  const { count } = await db
    .from("invitees")
    .select("id", { count: "exact", head: true })
    .eq("table_id", tableId);
  if ((count ?? 0) > 0) {
    throw new Error("Remove all table assignments before archiving this table.");
  }
  await db.from("tables").update({ is_active: false }).eq("id", tableId);
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "table.archive",
    entity_type: "table",
    entity_id: tableId,
  });
  revalidatePath("/admin/tables");
}
