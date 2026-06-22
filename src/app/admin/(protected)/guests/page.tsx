import Link from "next/link";
import { loadGuestAdminData } from "@/server/admin/operations";
import {
  archivePartyAction,
  adminRsvpOverrideAction,
  reissuePassAction,
  revokePassAction,
} from "./actions";
import {
  CreatePartyForm,
  ImportGuestsForm,
} from "@/components/admin/guest-admin-forms";

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const parties = await loadGuestAdminData(search);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Guests</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage one named guest per invitation, RSVP state, and passes.
          </p>
        </div>
        <Link href="/admin/guests/export" className="text-sm font-medium underline">
          Export CSV
        </Link>
      </div>

      <form className="mt-6 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search invited guests"
          className="min-h-11 flex-1 rounded-md border border-zinc-300 bg-white px-3"
        />
        <button className="min-h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_24rem]">
        <section>
          <div className="overflow-x-auto border-y border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-600">
                <tr>
                  <th className="py-3 pr-4">Guest</th>
                  <th className="py-3 pr-4">RSVP</th>
                  <th className="py-3 pr-4">Passes</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {parties.map((party) => (
                  <tr key={party.id}>
                    <td className="py-4 pr-4 align-top">
                      <p className="text-xs text-zinc-500">{party.email || "No email"}</p>
                      {(party.invitees ?? []).filter((guest) => guest.is_active).map((guest) => (
                        <div key={guest.id} className="mb-3">
                          <p>{guest.full_name}</p>
                          <form
                            action={adminRsvpOverrideAction}
                            className="mt-1 flex flex-wrap gap-1"
                          >
                            <input type="hidden" name="inviteeId" value={guest.id} />
                            <select
                              name="status"
                              defaultValue={guest.rsvp_status}
                              className="min-h-9 rounded border border-zinc-300 bg-white px-2 text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="attending">Attending</option>
                              <option value="declined">Declined</option>
                            </select>
                            <input
                              name="reason"
                              required
                              minLength={3}
                              placeholder="Override reason"
                              className="min-h-9 w-32 rounded border border-zinc-300 px-2 text-xs"
                            />
                            <button className="min-h-9 rounded border border-zinc-300 px-2 text-xs">
                              Save
                            </button>
                          </form>
                        </div>
                      ))}
                    </td>
                    <td className="py-4 pr-4 align-top">{party.rsvp_status}</td>
                    <td className="py-4 pr-4 align-top">
                      {(party.qr_passes ?? []).filter((pass) => pass.status === "active").map((pass) => (
                        <form key={pass.id} action={revokePassAction}>
                          <input type="hidden" name="passId" value={pass.id} />
                          <button className="text-red-700 underline">Revoke active pass</button>
                        </form>
                      ))}
                      {(party.invitees ?? [])
                        .filter((guest) => guest.is_active && guest.rsvp_status === "attending")
                        .map((guest) => (
                          <form key={guest.id} action={reissuePassAction}>
                            <input type="hidden" name="inviteeId" value={guest.id} />
                            <button className="mt-1 text-zinc-700 underline">
                              Reissue for {guest.full_name}
                            </button>
                          </form>
                        ))}
                    </td>
                    <td className="py-4 align-top">
                      {party.status === "active" && (
                        <form action={archivePartyAction}>
                          <input type="hidden" name="partyId" value={party.id} />
                          <button className="text-red-700 underline">Archive</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Create invitation</h2>
            <CreatePartyForm />
          </section>
          <section className="border-t border-zinc-200 pt-8">
            <h2 className="mb-2 text-lg font-semibold">CSV import</h2>
            <p className="mb-4 text-xs text-zinc-600">
              Required column: full_name. Optional: email.
            </p>
            <ImportGuestsForm />
          </section>
        </aside>
      </div>
    </main>
  );
}
