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
    .eq("id", inviteeId);
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

export async function updateTableAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      tableId: z.string().uuid(),
      name: z.string().trim().min(1).max(80),
      capacity: z.coerce.number().int().min(1).max(100),
      locationNote: z.string().trim().max(200).optional(),
    })
    .parse({
      tableId: formData.get("tableId"),
      name: formData.get("name"),
      capacity: formData.get("capacity"),
      locationNote: formData.get("locationNote") || undefined,
    });
  const db = createAdminClient();
  if (!db) return;
  const { error } = await db
    .from("tables")
    .update({
      name: parsed.name,
      capacity: parsed.capacity,
      location_note: parsed.locationNote || null,
    })
    .eq("id", parsed.tableId);
  if (error) throw new Error(error.message);
  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "table.update",
    entity_type: "table",
    entity_id: parsed.tableId,
    after: { name: parsed.name, capacity: parsed.capacity },
  });
  revalidatePath("/admin/tables");
}

export async function deleteTableAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const tableId = z.string().uuid().parse(formData.get("tableId"));
  const db = createAdminClient();
  if (!db) return;

  const { data: table } = await db
    .from("tables")
    .select("name")
    .eq("id", tableId)
    .single();

  // Hard delete. invitees.table_id FK is ON DELETE SET NULL, so seated guests
  // are simply un-seated, never removed.
  const { error } = await db.from("tables").delete().eq("id", tableId);
  if (error) throw new Error(error.message);

  await db.from("audit_logs").insert({
    actor_user_id: admin.userId,
    action: "table.delete",
    entity_type: "table",
    entity_id: tableId,
    before: { name: table?.name ?? null },
  });
  revalidatePath("/admin/tables");
}
