"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import {
  loadAttendanceSubject,
  recordAttendance,
  resolveQrSubject,
  type AttendanceSubject,
} from "@/server/attendance/service";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export type ScannerState =
  | { status: "idle" }
  | { status: "found"; subject: AttendanceSubject }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

function tokenFromScan(value: string): string {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? "";
  } catch {
    return trimmed;
  }
}

export async function resolveScanAction(
  _previous: ScannerState,
  formData: FormData,
): Promise<ScannerState> {
  const admin = await requireAdmin();
  if (
    !rateLimit(`qrValidate:${admin.userId}`, RATE_LIMITS.qrValidate).success
  ) {
    return { status: "error", message: "Scanner rate limit reached." };
  }
  const scan = z.string().min(16).max(2048).safeParse(formData.get("scan"));
  if (!scan.success) return { status: "invalid", message: "Invalid QR value." };
  const subject = await resolveQrSubject(tokenFromScan(scan.data));
  if (!subject) {
    return { status: "invalid", message: "This pass is invalid or revoked." };
  }
  return { status: "found", subject };
}

export async function checkInAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const inviteeId = z.string().uuid().parse(formData.get("inviteeId"));
  const method = z.enum(["qr", "manual"]).parse(formData.get("method"));
  const subject = await loadAttendanceSubject(inviteeId);
  if (!subject) {
    throw new Error("This guest could not be found.");
  }
  await recordAttendance({
    inviteeId,
    eventType: "checked_in",
    method,
    adminUserId: admin.userId,
  });
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/attendance/scan");
  revalidatePath("/admin");
}

export async function reverseCheckInAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      inviteeId: z.string().uuid(),
      reason: z.string().trim().min(3).max(300),
    })
    .parse({
      inviteeId: formData.get("inviteeId"),
      reason: formData.get("reason"),
    });
  await recordAttendance({
    inviteeId: parsed.inviteeId,
    eventType: "check_in_reversed",
    method: "manual",
    adminUserId: admin.userId,
    reason: parsed.reason,
  });
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
}
