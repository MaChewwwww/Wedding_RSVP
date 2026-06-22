import { loadTableAdminData } from "@/server/admin/operations";
import {
  archiveTableAction,
  assignTableAction,
  createTableAction,
} from "./actions";

export default async function TablesPage() {
  const data = await loadTableAdminData();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <h1 className="text-3xl font-semibold">Tables and seating</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Capacity is enforced transactionally by the database.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Table capacity</h2>
        <div className="mt-4 overflow-x-auto border-y border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-3 pr-4">Table</th>
                <th className="py-3 pr-4">Capacity</th>
                <th className="py-3 pr-4">Assigned</th>
                <th className="py-3 pr-4">Remaining</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {data.tables.map((table) => (
                <tr key={table.table_id}>
                  <td className="py-3 pr-4 font-medium">{table.name}</td>
                  <td className="py-3 pr-4">{table.capacity}</td>
                  <td className="py-3 pr-4">{table.assigned}</td>
                  <td className="py-3 pr-4">{table.remaining}</td>
                  <td className="py-3">
                    <form action={archiveTableAction}>
                      <input type="hidden" name="tableId" value={table.table_id} />
                      <button className="text-red-700 underline">Archive</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[20rem_1fr]">
        <section>
          <h2 className="text-lg font-semibold">Create table</h2>
          <form action={createTableAction} className="mt-4 space-y-3">
            <input name="name" required placeholder="Table name" className="min-h-11 w-full rounded-md border border-zinc-300 px-3" />
            <input name="capacity" required type="number" min="1" placeholder="Capacity" className="min-h-11 w-full rounded-md border border-zinc-300 px-3" />
            <input name="locationNote" placeholder="Location note" className="min-h-11 w-full rounded-md border border-zinc-300 px-3" />
            <button className="min-h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white">
              Create table
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Attendee assignments</h2>
          <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
            {data.attendees.map((attendee) => {
              return (
                <form
                  action={assignTableAction}
                  key={attendee.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <input type="hidden" name="inviteeId" value={attendee.id} />
                  <div>
                    <p className="font-medium">{attendee.full_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      name="tableId"
                      defaultValue={attendee.table_id ?? "unassigned"}
                      className="min-h-11 rounded-md border border-zinc-300 bg-white px-3"
                    >
                      <option value="unassigned">Unassigned</option>
                      {data.tables.map((table) => (
                        <option key={table.table_id} value={table.table_id}>
                          {table.name} ({table.remaining} remaining)
                        </option>
                      ))}
                    </select>
                    <button className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm">
                      Save
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
