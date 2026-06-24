"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Undo2,
  Check,
} from "lucide-react";
import { checkInAction, reverseCheckInAction } from "./actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  AdminTable,
  Table,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  TableEmpty,
} from "@/components/admin/admin-table";

type Row = {
  id: string;
  full_name: string;
  rsvp_status: string;
  tableName: string | null;
  checkedIn: boolean;
  lastEventAt: string | null;
};

function fmt(ts: string | null) {
  if (!ts) return "";
  try {
    return new Intl.DateTimeFormat("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

function statusBadge(status: string) {
  if (status === "attending") return <Badge variant="success">Attending</Badge>;
  if (status === "declined")
    return <Badge variant="danger">Not attending</Badge>;
  return <Badge variant="warning">Undecided</Badge>;
}

export function AttendanceClient({
  rows,
  search,
  checkedInCount,
}: {
  rows: Row[];
  search: string;
  checkedInCount: number;
}) {
  const { pending, run } = useAdminAction();
  const [reverseTarget, setReverseTarget] = React.useState<Row | null>(null);

  function checkIn(id: string) {
    run(
      () => {
        const fd = new FormData();
        fd.set("inviteeId", id);
        fd.set("method", "manual");
        return checkInAction(fd);
      },
      { loading: "Checking in…", success: "Checked in" },
    );
  }

  return (
    <div>
      {/* Summary + scanner link */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
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
            {rows.length - checkedInCount} not yet in
          </span>
        </div>
        <Link href="/admin/attendance/scan" className="ml-auto">
          <Button variant="primary">
            <QrCode className="h-4 w-4" />
            Open QR Scanner
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search guest name…"
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Roster table */}
      <AdminTable>
        <Table>
          <TableHead>
            <tr>
              <Th>Guest</Th>
              <Th>Table</Th>
              <Th>RSVP</Th>
              <Th>Check-in</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <TableEmpty message="No guests found." />}
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td className="font-medium text-ink">{row.full_name}</Td>
                <Td className="text-muted-ink">
                  {row.tableName ?? "—"}
                </Td>
                <Td>{statusBadge(row.rsvp_status)}</Td>
                <Td>
                  {row.checkedIn ? (
                    <span className="inline-flex items-center gap-1.5 text-sage-deep">
                      <Check className="h-4 w-4" />
                      <span className="text-xs">{fmt(row.lastEventAt)}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-ink">Not checked in</span>
                  )}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    {row.checkedIn ? (
                      <Button
                        onClick={() => setReverseTarget(row)}
                        disabled={pending}
                        size="sm"
                        variant="outline"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Reverse
                      </Button>
                    ) : (
                      <Button
                        onClick={() => checkIn(row.id)}
                        disabled={pending}
                        size="sm"
                        variant="secondary"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Check in
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </AdminTable>

      {/* Reverse check-in modal */}
      <Modal
        open={reverseTarget !== null}
        onClose={() => setReverseTarget(null)}
        title="Reverse check-in"
        description={reverseTarget?.full_name}
        className="max-w-md"
      >
        {reverseTarget && (
          <form
            action={(fd) =>
              run(() => reverseCheckInAction(fd), {
                loading: "Reversing…",
                success: "Check-in reversed",
                onSuccess: () => setReverseTarget(null),
              })
            }
            className="space-y-4"
          >
            <input type="hidden" name="inviteeId" value={reverseTarget.id} />
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason (required)</Label>
              <Input
                id="reason"
                name="reason"
                required
                minLength={3}
                placeholder="e.g. Checked in by mistake"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReverseTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" disabled={pending}>
                {pending ? "Reversing…" : "Reverse check-in"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
