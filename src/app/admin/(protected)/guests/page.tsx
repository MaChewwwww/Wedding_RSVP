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
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Download, Search } from "lucide-react";

function rsvpBadge(status: string) {
  if (status === "attending") return <Badge variant="success">Attending</Badge>;
  if (status === "declined") return <Badge variant="danger">Declined</Badge>;
  return <Badge variant="muted">Pending</Badge>;
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const parties = await loadGuestAdminData(search);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <PageHeader
        title="Guests"
        subtitle="Manage invitations, RSVP states, and digital passes."
      >
        <Link href="/admin/guests/export">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </Link>
      </PageHeader>

      {/* ── Search ── */}
      <form className="mb-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60 pointer-events-none" aria-hidden />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search guests by name or email…"
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="primary" size="default">
          Search
        </Button>
      </form>

      <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">

        {/* ── Guest table ── */}
        <section>
          <AdminTable>
            <Table>
              <TableHead>
                <tr>
                  <Th>Guest / Email</Th>
                  <Th>Party RSVP</Th>
                  <Th>Passes</Th>
                  <Th>Actions</Th>
                </tr>
              </TableHead>
              <TableBody>
                {parties.length === 0 && (
                  <TableEmpty message="No guests found. Try a different search or create one →" />
                )}
                {parties.map((party) => (
                  <Tr key={party.id}>
                    {/* Guest column */}
                    <Td>
                      <p className="text-xs text-muted-ink mb-1">{party.email || "No email"}</p>
                      {(party.invitees ?? [])
                        .filter((g) => g.is_active)
                        .map((guest) => (
                          <div key={guest.id} className="mb-3 last:mb-0">
                            <p className="font-medium text-ink mb-1">{guest.full_name}</p>
                            {/* RSVP override inline form */}
                            <form
                              action={adminRsvpOverrideAction}
                              className="flex flex-wrap items-center gap-1.5"
                            >
                              <input type="hidden" name="inviteeId" value={guest.id} />
                              <Select
                                name="status"
                                defaultValue={guest.rsvp_status}
                                className="min-h-8 w-32 text-xs py-1.5 px-2"
                              >
                                <option value="pending">Pending</option>
                                <option value="attending">Attending</option>
                                <option value="declined">Declined</option>
                              </Select>
                              <Input
                                name="reason"
                                required
                                minLength={3}
                                placeholder="Override reason"
                                className="min-h-8 w-36 text-xs py-1.5"
                              />
                              <Button type="submit" size="sm" variant="outline">
                                Save
                              </Button>
                            </form>
                          </div>
                        ))}
                    </Td>

                    {/* RSVP status */}
                    <Td>{rsvpBadge(party.rsvp_status)}</Td>

                    {/* Passes */}
                    <Td>
                      <div className="flex flex-col gap-1.5">
                        {(party.qr_passes ?? [])
                          .filter((p) => p.status === "active")
                          .map((pass) => (
                            <form key={pass.id} action={revokePassAction}>
                              <input type="hidden" name="passId" value={pass.id} />
                              <Button type="submit" size="sm" variant="danger">
                                Revoke pass
                              </Button>
                            </form>
                          ))}
                        {(party.invitees ?? [])
                          .filter((g) => g.is_active && g.rsvp_status === "attending")
                          .map((guest) => (
                            <form key={guest.id} action={reissuePassAction}>
                              <input type="hidden" name="inviteeId" value={guest.id} />
                              <Button type="submit" size="sm" variant="ghost">
                                Reissue — {guest.full_name}
                              </Button>
                            </form>
                          ))}
                      </div>
                    </Td>

                    {/* Archive */}
                    <Td>
                      {party.status === "active" && (
                        <form action={archivePartyAction}>
                          <input type="hidden" name="partyId" value={party.id} />
                          <Button type="submit" size="sm" variant="danger">
                            Archive
                          </Button>
                        </form>
                      )}
                      {party.status === "archived" && (
                        <Badge variant="muted">Archived</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
          </AdminTable>
        </section>

        {/* ── Sidebar forms ── */}
        <aside className="space-y-6">
          {/* Create invitation */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(253,232,240,0.35)",
              border: "1px solid rgba(240,168,188,0.25)",
            }}
          >
            <h2 className="font-display text-xl font-semibold text-ink mb-4">
              Create invitation
            </h2>
            <CreatePartyForm />
          </div>

          <Separator />

          {/* CSV import */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(181,160,213,0.08)",
              border: "1px solid rgba(181,160,213,0.2)",
            }}
          >
            <h2 className="font-display text-xl font-semibold text-ink mb-1">
              CSV Import
            </h2>
            <p className="mb-4 text-xs text-muted-ink">
              Required column: <code className="font-mono text-rose">full_name</code>. Optional: <code className="font-mono text-rose">email</code>.
            </p>
            <ImportGuestsForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
