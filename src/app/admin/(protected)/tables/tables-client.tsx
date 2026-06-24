"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import {
  assignTableAction,
  createTableAction,
  deleteTableAction,
  updateTableAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type TableRow = {
  table_id: string;
  name: string;
  capacity: number;
  assigned: number;
  remaining: number;
  location_note: string | null;
};
type Guest = {
  id: string;
  full_name: string;
  rsvp_status: string;
  table_id: string | null;
};

function statusDot(status: string) {
  if (status === "attending") return "#5a9c56";
  if (status === "declined") return "#d4516e";
  return "#c8963c";
}

export function TablesClient({
  tables,
  guests,
}: {
  tables: TableRow[];
  guests: Guest[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<TableRow | null>(null);
  const [viewTarget, setViewTarget] = React.useState<TableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TableRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const guestsByTable = React.useMemo(() => {
    const map = new Map<string, Guest[]>();
    for (const g of guests) {
      if (!g.table_id) continue;
      const list = map.get(g.table_id) ?? [];
      list.push(g);
      map.set(g.table_id, list);
    }
    return map;
  }, [guests]);

  const unseated = guests.filter((g) => !g.table_id);

  function refresh() {
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const fd = new FormData();
    fd.set("tableId", deleteTarget.table_id);
    await deleteTableAction(fd);
    setDeleting(false);
    setDeleteTarget(null);
    refresh();
  }

  // Keep the view modal's data fresh after assignments.
  const viewTable = viewTarget
    ? tables.find((t) => t.table_id === viewTarget.table_id) ?? viewTarget
    : null;
  const seated = viewTable ? guestsByTable.get(viewTable.table_id) ?? [] : [];

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setAddOpen(true)} variant="primary">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="rounded-2xl border border-blush/20 bg-paper/60 py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-ink/40" aria-hidden />
          <p className="text-sm text-muted-ink">
            No tables yet. Add your first table to start seating guests.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((t) => {
            const pct =
              t.capacity > 0 ? Math.round((t.assigned / t.capacity) * 100) : 0;
            const barColor =
              pct >= 100 ? "#d4516e" : pct >= 80 ? "#c8963c" : "#5a9c56";
            const tableGuests = guestsByTable.get(t.table_id) ?? [];
            return (
              <article
                key={t.table_id}
                className="flex flex-col rounded-2xl border border-blush/20 bg-paper/90 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {t.name}
                    </h3>
                    {t.location_note && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-ink">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {t.location_note}
                      </p>
                    )}
                  </div>
                  <Badge variant={t.remaining <= 0 ? "danger" : "muted"}>
                    {t.assigned}/{t.capacity}
                  </Badge>
                </div>

                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-ink">
                    {t.remaining > 0
                      ? `${t.remaining} seat${t.remaining === 1 ? "" : "s"} open`
                      : "Full"}
                  </p>
                </div>

                {/* Seated preview */}
                <div className="mt-3 flex-1">
                  {tableGuests.length === 0 ? (
                    <p className="text-xs text-muted-ink/70">No guests seated yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {tableGuests.slice(0, 4).map((g) => (
                        <li
                          key={g.id}
                          className="flex items-center gap-2 text-sm text-ink"
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: statusDot(g.rsvp_status) }}
                          />
                          {g.full_name}
                        </li>
                      ))}
                      {tableGuests.length > 4 && (
                        <li className="text-xs text-muted-ink">
                          +{tableGuests.length - 4} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-blush/15 pt-3">
                  <Button
                    onClick={() => setViewTarget(t)}
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    onClick={() => setEditTarget(t)}
                    size="icon"
                    variant="outline"
                    className="h-9 w-9"
                    title="Edit table"
                    aria-label="Edit table"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(t)}
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-danger hover:bg-[rgba(176,48,80,0.08)]"
                    title="Delete table"
                    aria-label="Delete table"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add table modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Table"
        description="Capacity is enforced — guests of any RSVP status can be seated."
      >
        <form
          action={async (fd) => {
            await createTableAction(fd);
            setAddOpen(false);
            refresh();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Table name</Label>
            <Input id="name" name="name" required placeholder="e.g. Table 1, Sweetheart Table" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" name="capacity" type="number" required min="1" placeholder="8" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locationNote">
              Location note <span className="text-muted-ink">(optional)</span>
            </Label>
            <Input id="locationNote" name="locationNote" placeholder="e.g. Near the stage" />
          </div>
          <Button type="submit" className="w-full">
            Create table
          </Button>
        </form>
      </Modal>

      {/* Edit table modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title="Edit Table"
      >
        {editTarget && (
          <form
            action={async (fd) => {
              await updateTableAction(fd);
              setEditTarget(null);
              refresh();
            }}
            className="space-y-4"
          >
            <input type="hidden" name="tableId" value={editTarget.table_id} />
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Table name</Label>
              <Input id="edit-name" name="name" required defaultValue={editTarget.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                required
                min={Math.max(editTarget.assigned, 1)}
                defaultValue={editTarget.capacity}
              />
              <p className="text-xs text-muted-ink">
                {editTarget.assigned} guest{editTarget.assigned === 1 ? "" : "s"} currently seated.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-location">
                Location note <span className="text-muted-ink">(optional)</span>
              </Label>
              <Input
                id="edit-location"
                name="locationNote"
                defaultValue={editTarget.location_note ?? ""}
              />
            </div>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>
        )}
      </Modal>

      {/* View / manage seating modal */}
      <Modal
        open={viewTable !== null}
        onClose={() => setViewTarget(null)}
        title={viewTable?.name}
        description={
          viewTable
            ? `${seated.length} of ${viewTable.capacity} seats filled`
            : undefined
        }
        className="max-w-xl"
      >
        {viewTable && (
          <div className="space-y-5">
            {/* Seated guests */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-ink">
                Seated guests
              </h4>
              {seated.length === 0 ? (
                <p className="text-sm text-muted-ink">No one seated here yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {seated.map((g) => (
                    <li
                      key={g.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-paper-2/60 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: statusDot(g.rsvp_status) }}
                        />
                        {g.full_name}
                      </span>
                      <form
                        action={async (fd) => {
                          await assignTableAction(fd);
                          refresh();
                        }}
                      >
                        <input type="hidden" name="inviteeId" value={g.id} />
                        <input type="hidden" name="tableId" value="unassigned" />
                        <Button
                          type="submit"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-ink hover:text-danger"
                          title="Remove from table"
                          aria-label="Remove from table"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add guest to table */}
            {viewTable.remaining > 0 && unseated.length > 0 && (
              <div className="border-t border-blush/15 pt-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-ink">
                  <UserPlus className="h-3.5 w-3.5" /> Seat a guest
                </h4>
                <form
                  action={async (fd) => {
                    await assignTableAction(fd);
                    refresh();
                  }}
                  className="flex gap-2"
                >
                  <input type="hidden" name="tableId" value={viewTable.table_id} />
                  <Select name="inviteeId" required defaultValue="" className="flex-1">
                    <option value="" disabled>
                      Choose a guest…
                    </option>
                    {unseated.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.full_name}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" variant="secondary">
                    Seat
                  </Button>
                </form>
              </div>
            )}
            {viewTable.remaining <= 0 && (
              <p className="rounded-xl bg-[rgba(176,48,80,0.06)] px-3 py-2 text-xs text-danger">
                This table is full.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        pending={deleting}
        title="Delete this table?"
        confirmLabel="Delete table"
        message={
          <>
            <strong>{deleteTarget?.name}</strong> will be removed. Any seated
            guests will be un-seated but not deleted.
          </>
        }
      />
    </div>
  );
}
