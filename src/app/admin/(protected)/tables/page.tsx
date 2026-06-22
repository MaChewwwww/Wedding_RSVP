import { loadTableAdminData } from "@/server/admin/operations";
import {
  archiveTableAction,
  assignTableAction,
  createTableAction,
} from "./actions";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

export default async function TablesPage() {
  const data = await loadTableAdminData();

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Tables &amp; Seating"
        subtitle="Capacity is enforced transactionally by the database."
      />

      {/* ── Table capacity overview ── */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold text-ink mb-4">
          Table capacity
        </h2>
        <AdminTable>
          <Table>
            <TableHead>
              <tr>
                <Th>Table name</Th>
                <Th>Capacity</Th>
                <Th>Assigned</Th>
                <Th>Remaining</Th>
                <Th>Fill</Th>
                <Th>Action</Th>
              </tr>
            </TableHead>
            <TableBody>
              {data.tables.length === 0 && (
                <TableEmpty message="No tables yet. Create one below →" />
              )}
              {data.tables.map((table) => {
                const pct = table.capacity > 0
                  ? Math.round((table.assigned / table.capacity) * 100)
                  : 0;
                const barColor =
                  pct >= 100 ? "#d4516e" : pct >= 80 ? "#c8963c" : "#5a9c56";
                return (
                  <Tr key={table.table_id}>
                    <Td className="font-semibold text-ink">{table.name}</Td>
                    <Td>{table.capacity}</Td>
                    <Td>{table.assigned}</Td>
                    <Td>{table.remaining}</Td>
                    <Td>
                      {/* Capacity fill bar */}
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-paper-2">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <span className="text-xs text-muted-ink">{pct}%</span>
                      </div>
                    </Td>
                    <Td>
                      <form action={archiveTableAction}>
                        <input type="hidden" name="tableId" value={table.table_id} />
                        <Button type="submit" size="sm" variant="danger">
                          Archive
                        </Button>
                      </form>
                    </Td>
                  </Tr>
                );
              })}
            </TableBody>
          </Table>
        </AdminTable>
      </section>

      <Separator className="mb-10" />

      <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">

        {/* ── Create table form ── */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Create table
          </h2>
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: "rgba(181,160,213,0.08)",
              border: "1px solid rgba(181,160,213,0.22)",
            }}
          >
            <form action={createTableAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Table name</Label>
                <Input id="name" name="name" required placeholder="e.g. Table 1, Sweetheart Table" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" required min="1" placeholder="8" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="locationNote">Location note <span className="text-muted-ink">(optional)</span></Label>
                <Input id="locationNote" name="locationNote" placeholder="e.g. Near the stage" />
              </div>
              <Button type="submit" size="default" className="w-full">
                Create table
              </Button>
            </form>
          </div>
        </section>

        {/* ── Attendee assignments ── */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Attendee assignments
          </h2>
          {data.attendees.length === 0 ? (
            <p className="text-sm text-muted-ink">No attending guests yet.</p>
          ) : (
            <div
              className="divide-y rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(240,168,188,0.2)",
                "--tw-divide-color": "rgba(240,168,188,0.15)",
              } as React.CSSProperties}
            >
              {data.attendees.map((attendee) => (
                <form
                  action={assignTableAction}
                  key={attendee.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/40 hover:bg-blush-light/20 transition-colors"
                >
                  <input type="hidden" name="inviteeId" value={attendee.id} />
                  <p className="font-medium text-ink">{attendee.full_name}</p>
                  <div className="flex gap-2 items-center">
                    <Select
                      name="tableId"
                      defaultValue={attendee.table_id ?? "unassigned"}
                      className="w-52"
                    >
                      <option value="unassigned">Unassigned</option>
                      {data.tables.map((table) => (
                        <option key={table.table_id} value={table.table_id}>
                          {table.name} ({table.remaining} remaining)
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
