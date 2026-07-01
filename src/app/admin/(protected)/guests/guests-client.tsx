"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Upload,
  Download,
  Search,
  Trash2,
  Ticket,
  TicketX,
  Mail,
  Users,
  Edit,
  Lock,
  Unlock,
} from "lucide-react";
import {
  adminRsvpOverrideAction,
  deleteGuestAction,
  reissuePassAction,
  revokePassAction,
} from "./actions";
import {
  CreatePartyForm,
  ImportGuestsForm,
} from "@/components/admin/guest-admin-forms";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  AdminTable,
  Table,
  TableHead,
  Th,
  TableBody,
  Tr,
  Td,
  TableEmpty,
  useTablePagination,
  TablePagination,
} from "@/components/admin/admin-table";

type Invitee = {
  id: string;
  full_name: string;
  rsvp_status: string;
  table_id: string | null;
  is_active: boolean;
};
type Pass = { id: string; invitee_id: string | null; status: string };
type Party = {
  id: string;
  display_name: string;
  status: string;
  rsvp_status: string;
  email: string | null;
  responded_at: string | null;
  updated_at: string | null;
  invitees: Invitee[] | null;
  qr_passes: Pass[] | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Undecided" },
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Not attending" },
];

function formatDate(isoString: string | null) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function StatusPill({ status }: { status: string }) {
  if (status === "attending") return <Badge variant="success">Attending</Badge>;
  if (status === "declined")
    return <Badge variant="danger">Not attending</Badge>;
  return <Badge variant="warning">Undecided</Badge>;
}

function GuestRow({ party }: { party: Party }) {
  const guest = (party.invitees ?? []).find((g) => g.is_active);
  const activePass = (party.qr_passes ?? []).find((p) => p.status === "active");
  const { pending, run } = useAdminAction();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [nameLocked, setNameLocked] = React.useState(true);

  if (!guest) return null;

  function pass(action: () => Promise<void>, kind: "revoke" | "issue") {
    run(action, {
      loading: kind === "revoke" ? "Revoking pass…" : "Issuing pass…",
      success: kind === "revoke" ? "Pass revoked" : "Pass issued",
    });
  }

  function remove() {
    run(
      () => {
        const fd = new FormData();
        fd.set("partyId", party.id);
        return deleteGuestAction(fd);
      },
      { loading: "Deleting guest…", success: "Guest deleted" },
    );
  }

  return (
    <Tr>
      <Td>
        <p className="font-medium text-ink">{guest.full_name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-ink">
          <Mail className="h-3 w-3" aria-hidden />
          {party.email || "No email"}
        </p>
      </Td>
      <Td>
        <StatusPill status={guest.rsvp_status} />
      </Td>
      <Td className="text-sm text-muted-ink">
        {formatDate(party.responded_at || party.updated_at)}
      </Td>
      <Td>
        {activePass ? (
          <Button
            onClick={() =>
              pass(() => {
                const fd = new FormData();
                fd.set("passId", activePass.id);
                return revokePassAction(fd);
              }, "revoke")
            }
            disabled={pending}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            <TicketX className="h-3.5 w-3.5" />
            Revoke
          </Button>
        ) : guest.rsvp_status === "attending" ? (
          <Button
            onClick={() =>
              pass(() => {
                const fd = new FormData();
                fd.set("inviteeId", guest.id);
                return reissuePassAction(fd);
              }, "issue")
            }
            disabled={pending}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            <Ticket className="h-3.5 w-3.5" />
            Issue
          </Button>
        ) : (
          <span className="text-xs text-muted-ink/60">—</span>
        )}
      </Td>
      <Td className="text-right">
        <Button
          onClick={() => setUpdateOpen(true)}
          disabled={pending}
          size="icon"
          variant="ghost"
          title="Update status"
          aria-label="Update status"
          className="mr-1 h-9 w-9 text-muted-ink hover:bg-[rgba(0,0,0,0.08)]"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          size="icon"
          variant="ghost"
          title="Delete guest"
          aria-label="Delete guest"
          className="h-9 w-9 text-danger hover:bg-[rgba(176,48,80,0.08)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Td>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          remove();
        }}
        pending={pending}
        title="Delete this guest?"
        confirmLabel="Delete guest"
        message={
          <>
            <strong>{party.display_name}</strong> and their passes and check-in
            history will be permanently removed. This cannot be undone.
          </>
        }
      />

      <Modal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title="Update Status"
        description={`Manually update RSVP status for ${guest.full_name}.`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("inviteeId", guest.id);
            fd.set("reason", "Manual status update by admin");
            const newStatus = fd.get("status") as string;
            const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? newStatus;
            run(() => adminRsvpOverrideAction(fd), {
              loading: "Updating status…",
              success: `Marked ${label}`,
              onSuccess: () => setUpdateOpen(false),
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Status</label>
            <Select name="status" defaultValue={guest.rsvp_status} className="w-full">
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Guest Name</label>
            <div className="flex gap-2">
              <Input
                name="fullName"
                type="text"
                defaultValue={guest.full_name}
                disabled={nameLocked}
                className="w-full"
                required
                minLength={2}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setNameLocked(!nameLocked)}
                className="shrink-0 text-muted-ink"
                title={nameLocked ? "Unlock to edit" : "Lock"}
              >
                {nameLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Email</label>
            <Input
              name="email"
              type="email"
              defaultValue={party.email || ""}
              placeholder="e.g. guest@example.com (optional)"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendEmail"
              name="sendEmail"
              value="true"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="sendEmail" className="text-sm text-ink">
              Send QR Code Email (if attending)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setUpdateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Tr>
  );
}

export function GuestsClient({
  parties,
  search,
}: {
  parties: Party[];
  search: string;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const attending = parties.filter((p) => p.rsvp_status === "attending").length;
  const declined = parties.filter((p) => p.rsvp_status === "declined").length;
  const undecided = parties.length - attending - declined;

  const [filterRsvp, setFilterRsvp] = React.useState("all");

  const filteredParties = React.useMemo(() => {
    return parties.filter((p) => filterRsvp === "all" || p.rsvp_status === filterRsvp);
  }, [parties, filterRsvp]);

  const { page, setPage, totalPages, currentData } = useTablePagination(filteredParties, 20);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form 
          className="relative min-w-[16rem] flex-1 max-w-md flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const q = fd.get("q") as string;
            router.push(`?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60 z-10"
              aria-hidden
            />
            <Input
              name="q"
              defaultValue={search}
              placeholder="Search guests by name or email…"
              className="pl-10 w-full"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <Select
          value={filterRsvp}
          onChange={(e) => setFilterRsvp(e.target.value)}
          className="w-[140px] md:w-[160px]"
        >
          <option value="all">All RSVPs</option>
          <option value="attending">Attending</option>
          <option value="declined">Not attending</option>
          <option value="pending">Undecided</option>
        </Select>
        <Button onClick={() => setAddOpen(true)} variant="primary">
          <UserPlus className="h-4 w-4" />
          Add Guest
        </Button>
        <Button onClick={() => setBulkOpen(true)} variant="secondary">
          <Upload className="h-4 w-4" />
          Bulk Add
        </Button>
        <a href="/admin/guests/export">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </a>
      </div>

      {/* Summary chips */}
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-muted-ink">
          <Users className="h-3.5 w-3.5" /> {parties.length} total
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-light px-3 py-1.5 text-sage-deep">
          {attending} attending
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-butter-light px-3 py-1.5 text-butter-deep">
          {undecided} undecided
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(176,48,80,0.1)] px-3 py-1.5 text-danger">
          {declined} not attending
        </span>
      </div>

      {/* Guest table */}
      <AdminTable>
        <Table>
          <TableHead>
            <tr>
              <Th>Guest</Th>
              <Th>Status</Th>
              <Th>Last Updated</Th>
              <Th>Pass</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHead>
          <TableBody>
            {filteredParties.length === 0 && (
              <TableEmpty message="No guests found. Add one to get started." />
            )}
            {currentData.map((party) => (
              <GuestRow key={party.id} party={party} />
            ))}
          </TableBody>
        </Table>
        <TablePagination page={page} totalPages={totalPages} setPage={setPage} />
      </AdminTable>

      {/* Add Guest modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Guest"
        description="Create a single invitation. New guests start as Undecided."
      >
        <CreatePartyForm onDone={() => setAddOpen(false)} />
      </Modal>

      {/* Bulk Add modal */}
      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Add Guests"
        description="Add guests one per line. Format: Name, Email (email is optional)"
      >
        <ImportGuestsForm onDone={() => setBulkOpen(false)} />
      </Modal>
    </div>
  );
}
