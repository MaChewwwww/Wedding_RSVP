"use client";

import * as React from "react";
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
  invitees: Invitee[] | null;
  qr_passes: Pass[] | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Undecided" },
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Not attending" },
];

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

  if (!guest) return null;

  function changeStatus(status: string) {
    if (status === guest!.rsvp_status) return;
    const label =
      STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    run(
      () => {
        const fd = new FormData();
        fd.set("inviteeId", guest!.id);
        fd.set("status", status);
        fd.set("reason", "Manual status update by admin");
        return adminRsvpOverrideAction(fd);
      },
      { loading: "Updating status…", success: `Marked ${label}` },
    );
  }

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
      <Td>
        <Select
          value={guest.rsvp_status}
          disabled={pending}
          aria-label={`Set status for ${guest.full_name}`}
          onChange={(e) => changeStatus(e.target.value)}
          className="min-h-9 w-40 py-1.5 text-xs"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
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
  const [addOpen, setAddOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const attending = parties.filter((p) => p.rsvp_status === "attending").length;
  const declined = parties.filter((p) => p.rsvp_status === "declined").length;
  const undecided = parties.length - attending - declined;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form className="relative min-w-[16rem] flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-ink/60"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search guests by name or email…"
            className="pl-10"
          />
        </form>
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
              <Th>Set Status</Th>
              <Th>Pass</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </TableHead>
          <TableBody>
            {parties.length === 0 && (
              <TableEmpty message="No guests found. Add one to get started." />
            )}
            {parties.map((party) => (
              <GuestRow key={party.id} party={party} />
            ))}
          </TableBody>
        </Table>
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
        description="Paste CSV with a full_name column (email optional)."
      >
        <ImportGuestsForm onDone={() => setBulkOpen(false)} />
      </Modal>
    </div>
  );
}
