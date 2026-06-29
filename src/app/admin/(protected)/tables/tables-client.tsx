"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Settings2,
  MapPin,
  Users,
  UserPlus,
  X,
  Armchair,
  Search,
} from "lucide-react";
import {
  assignTableAction,
  createTableAction,
  deleteTableAction,
  updateTableAction,
} from "./actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
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
  is_checked_in: boolean;
};

function statusColor(status: string, isCheckedIn: boolean) {
  if (status === "attending") {
    return isCheckedIn ? "#5a9c56" : "#c8963c"; // Green if checked in, Yellow if not
  }
  if (status === "declined") return "#d4516e";
  return "#c8963c";
}

function SeatRing({
  capacity,
  assigned,
  colors,
}: {
  capacity: number;
  assigned: number;
  colors: string[];
}) {
  const seats = Array.from({ length: Math.min(capacity, 14) }, (_, i) => colors[i] || null);
  const radius = 46;
  const cx = 60;
  const cy = 60;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
      {/* table top */}
      <circle cx={cx} cy={cy} r={26} fill="rgba(240,168,188,0.18)" stroke="rgba(212,81,110,0.3)" />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-rose font-semibold"
        style={{ fontSize: "18px", fontFamily: "var(--font-display)" }}
      >
        {assigned}/{capacity}
      </text>
      {seats.map((seatColor, i) => {
        const angle = (i / seats.length) * 2 * Math.PI - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={seatColor ? seatColor : "#fde8f0"}
            stroke={seatColor ? seatColor : "#f0a8bc"}
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

function TableCard({
  table,
  guests,
  onManage,
  onEdit,
  onDelete,
}: {
  table: TableRow;
  guests: Guest[];
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = table.capacity > 0 ? (table.assigned / table.capacity) * 100 : 0;
  const accent = pct >= 100 ? "#d4516e" : pct >= 80 ? "#c8963c" : "#5a9c56";
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-blush/20 bg-paper/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Accent header */}
      <div
        className="flex items-start justify-between gap-2 px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${accent}1f, ${accent}08)`,
          borderBottom: `1px solid ${accent}26`,
        }}
      >
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-semibold text-ink">
            {table.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-ink">
            {table.location_note ? (
              <>
                <MapPin className="h-3 w-3" aria-hidden />
                {table.location_note}
              </>
            ) : (
              <span className="text-muted-ink/60">No location set</span>
            )}
          </p>
        </div>
        <Badge variant={table.remaining <= 0 ? "danger" : "success"}>
          {table.remaining <= 0 ? "Full" : `${table.remaining} open`}
        </Badge>
      </div>

      {/* Body: seat ring + guest preview */}
      <div className="flex gap-4 px-5 py-4">
        <div className="shrink-0">
          <SeatRing capacity={table.capacity} assigned={table.assigned} colors={guests.map((g) => statusColor(g.rsvp_status, g.is_checked_in))} />
        </div>
        <div className="min-w-0 flex-1">
          {guests.length === 0 ? (
            <p className="flex h-full items-center text-xs text-muted-ink/70">
              No guests seated yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {guests.slice(0, 4).map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-2 truncate text-sm text-ink"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: statusColor(g.rsvp_status, g.is_checked_in) }}
                  />
                  <span className="truncate">{g.full_name}</span>
                </li>
              ))}
              {guests.length > 4 && (
                <li className="text-xs font-medium text-rose">
                  +{guests.length - 4} more seated
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-1.5 border-t border-blush/15 px-4 py-3">
        <Button onClick={onManage} size="sm" variant="primary" className="flex-1">
          <Settings2 className="mr-1.5 h-3.5 w-3.5" />
          Assign Guests
        </Button>
        <Button
          onClick={onEdit}
          size="icon"
          variant="outline"
          className="h-9 w-9"
          title="Edit table"
          aria-label="Edit table"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          onClick={onDelete}
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
}

function GuestSearchCombobox({ guests }: { guests: Guest[] }) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = guests.filter((g) =>
    g.full_name.toLowerCase().includes(search.toLowerCase())
  );
  
  // To avoid submitting a non-existent guest, require a perfect match for the hidden input
  const selected = guests.find((g) => g.full_name === search);

  return (
    <div className="flex-1 relative" ref={wrapperRef}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60 z-10"
        aria-hidden
      />
      <input type="hidden" name="inviteeId" value={selected?.id ?? ""} />
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search for a guest to assign…"
        required
        autoComplete="off"
        className="w-full pl-10 bg-white"
      />
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded-lg border border-blush/30 shadow-xl z-50 py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-ink text-center">
              No guests found.
            </div>
          ) : (
            filtered.map((g) => (
              <button
                key={g.id}
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-blush-light transition-colors"
                onClick={() => {
                  setSearch(g.full_name);
                  setOpen(false);
                }}
              >
                {g.full_name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function TablesClient({
  tables,
  guests,
}: {
  tables: TableRow[];
  guests: Guest[];
}) {
  const { pending, run } = useAdminAction();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<TableRow | null>(null);
  const [manageTarget, setManageTarget] = React.useState<TableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TableRow | null>(null);

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

  const manageTable = manageTarget
    ? tables.find((t) => t.table_id === manageTarget.table_id) ?? manageTarget
    : null;
  const seated = manageTable ? guestsByTable.get(manageTable.table_id) ?? [] : [];

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
          <Armchair className="mx-auto mb-3 h-8 w-8 text-muted-ink/40" aria-hidden />
          <p className="text-sm text-muted-ink">
            No tables yet. Add your first table to start seating guests.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((t) => (
            <TableCard
              key={t.table_id}
              table={t}
              guests={guestsByTable.get(t.table_id) ?? []}
              onManage={() => setManageTarget(t)}
              onEdit={() => setEditTarget(t)}
              onDelete={() => setDeleteTarget(t)}
            />
          ))}
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
          action={(fd) =>
            run(() => createTableAction(fd), {
              loading: "Creating table…",
              success: "Table created",
              onSuccess: () => setAddOpen(false),
            })
          }
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
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating…" : "Create table"}
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
            action={(fd) =>
              run(() => updateTableAction(fd), {
                loading: "Saving changes…",
                success: "Table updated",
                onSuccess: () => setEditTarget(null),
              })
            }
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
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        )}
      </Modal>

      {/* Manage seating modal */}
      <Modal
        open={manageTable !== null}
        onClose={() => setManageTarget(null)}
        title={manageTable ? `Manage — ${manageTable.name}` : undefined}
        description={
          manageTable
            ? `${seated.length} of ${manageTable.capacity} seats filled`
            : undefined
        }
        className="max-w-xl"
      >
        {manageTable && (
          <div className="space-y-5">
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
                          style={{ background: statusColor(g.rsvp_status, g.is_checked_in) }}
                        />
                        {g.full_name}
                      </span>
                      <Button
                        onClick={() =>
                          run(
                            () => {
                              const fd = new FormData();
                              fd.set("inviteeId", g.id);
                              fd.set("tableId", "unassigned");
                              return assignTableAction(fd);
                            },
                            { loading: "Removing…", success: "Guest removed from table" },
                          )
                        }
                        disabled={pending}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-ink hover:text-danger"
                        title="Remove from table"
                        aria-label="Remove from table"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {manageTable.remaining > 0 && unseated.length > 0 && (
              <div className="border-t border-blush/15 pt-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-ink">
                  <UserPlus className="h-3.5 w-3.5" /> Seat a guest
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(() => assignTableAction(fd), {
                      loading: "Seating guest…",
                      success: "Guest seated",
                    });
                  }}
                  className="flex gap-2"
                >
                  <input type="hidden" name="tableId" value={manageTable.table_id} />
                  <GuestSearchCombobox guests={unseated} />
                  <Button type="submit" disabled={pending} variant="secondary">
                    Seat
                  </Button>
                </form>
              </div>
            )}
            {manageTable.remaining <= 0 && (
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
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) return;
          run(
            () => {
              const fd = new FormData();
              fd.set("tableId", target.table_id);
              return deleteTableAction(fd);
            },
            { loading: "Deleting table…", success: "Table deleted" },
          );
        }}
        pending={pending}
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
