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
  AlertCircle,
  Eye,
  XCircle,
} from "lucide-react";
import { site } from "@/config/site";
import { checkInAction, reverseCheckInAction } from "./actions";
import { adminRsvpOverrideAction } from "@/app/admin/(protected)/guests/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
  const [viewTarget, setViewTarget] = React.useState<Row | null>(null);
  const [updateRsvpTarget, setUpdateRsvpTarget] = React.useState<Row | null>(null);

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

  const isEarly = new Date() < new Date(`${site.event.weddingDate}T00:00:00`);

  return (
    <div>
      {/* Early testing warning */}
      {isEarly && (
        <div className="mb-6 flex gap-3 items-start rounded-xl border border-butter/30 bg-butter-light/20 p-4 text-sm text-butter-deep">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>Note:</strong> It is not yet the wedding date ({site.event.weddingDate}). You can still see attending guests and check them in for testing purposes.
          </p>
        </div>
      )}

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
              <Th className="hidden md:table-cell">Table</Th>
              <Th className="hidden md:table-cell">RSVP</Th>
              <Th>Check-in</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <TableEmpty message="No guests found." />}
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td className="font-medium text-ink">{row.full_name}</Td>
                <Td className="hidden md:table-cell text-muted-ink">
                  {row.tableName ?? "—"}
                </Td>
                <Td className="hidden md:table-cell">{statusBadge(row.rsvp_status)}</Td>
                <Td>
                  {row.checkedIn ? (
                    <span className="inline-flex items-center gap-1.5 text-sage-deep">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="hidden md:inline text-xs">{fmt(row.lastEventAt)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted-ink">
                      <XCircle className="h-4 w-4" />
                      <span className="hidden md:inline text-xs">Not checked in</span>
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setViewTarget(row)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 px-0"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {row.checkedIn ? (
                      <Button
                        onClick={() => setReverseTarget(row)}
                        disabled={pending}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 shrink-0 px-0 md:h-9 md:w-auto md:px-3"
                      >
                        <Undo2 className="h-3.5 w-3.5 md:mr-1.5" />
                        <span className="hidden md:inline">Reverse</span>
                      </Button>
                    ) : row.rsvp_status === "attending" ? (
                      <Button
                        onClick={() => checkIn(row.id)}
                        disabled={pending}
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 shrink-0 px-0 md:h-9 md:w-auto md:px-3"
                      >
                        <Check className="h-3.5 w-3.5 md:mr-1.5" />
                        <span className="hidden md:inline">Check in</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setUpdateRsvpTarget(row)}
                        disabled={pending}
                        size="sm"
                        variant="secondary"
                        className="h-8 shrink-0 px-2 md:h-9 md:px-3 whitespace-nowrap bg-butter-deep text-white hover:bg-butter-deep/90 border-transparent"
                      >
                        Update RSVP
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </AdminTable>

      {/* View details modal */}
      <Modal
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        title="Guest Details"
        description={viewTarget?.full_name}
        className="max-w-md"
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-ink block mb-1">RSVP Status</span>
                {statusBadge(viewTarget.rsvp_status)}
              </div>
              <div>
                <span className="text-muted-ink block mb-1">Table</span>
                <span className="font-medium text-ink">{viewTarget.tableName ?? "Unassigned"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-ink block mb-1">Check-in Status</span>
                {viewTarget.checkedIn ? (
                  <span className="inline-flex items-center gap-1.5 text-sage-deep">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">{fmt(viewTarget.lastEventAt)}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-ink">
                    <XCircle className="h-4 w-4" />
                    <span>Not checked in</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-butter/20">
              <Button variant="ghost" size="sm" onClick={() => setViewTarget(null)}>
                Close
              </Button>
              {viewTarget.checkedIn ? (
                <Button
                  onClick={() => {
                    setViewTarget(null);
                    setReverseTarget(viewTarget);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                  Reverse check-in
                </Button>
              ) : viewTarget.rsvp_status === "attending" ? (
                <Button
                  onClick={() => {
                    setViewTarget(null);
                    checkIn(viewTarget.id);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Check in
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setViewTarget(null);
                    setUpdateRsvpTarget(viewTarget);
                  }}
                  variant="secondary"
                  size="sm"
                  className="bg-butter-deep text-white hover:bg-butter-deep/90 border-transparent"
                >
                  Update RSVP
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

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

      {/* Update RSVP modal */}
      <Modal
        open={updateRsvpTarget !== null}
        onClose={() => setUpdateRsvpTarget(null)}
        title="Update RSVP Status"
        description={`Manually update RSVP status for ${updateRsvpTarget?.full_name}.`}
      >
        {updateRsvpTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("inviteeId", updateRsvpTarget.id);
              fd.set("reason", "Manual status update at door");
              const newStatus = fd.get("status") as string;
              run(() => adminRsvpOverrideAction(fd), {
                loading: "Updating status…",
                success: `Status updated`,
                onSuccess: () => setUpdateRsvpTarget(null),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Status</label>
              <Select name="status" defaultValue={updateRsvpTarget.rsvp_status} className="w-full">
                <option value="pending">Undecided</option>
                <option value="attending">Attending</option>
                <option value="declined">Not attending</option>
              </Select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setUpdateRsvpTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={pending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
