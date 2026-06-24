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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  if (status === "attending")
    return <Badge variant="success">Attending</Badge>;
  if (status === "declined")
    return <Badge variant="danger">Not attending</Badge>;
  return <Badge variant="warning">Undecided</Badge>;
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
  const [deleteTarget, setDeleteTarget] = React.useState<Party | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const attending = parties.filter((p) => p.rsvp_status === "attending").length;
  const declined = parties.filter((p) => p.rsvp_status === "declined").length;
  const undecided = parties.length - attending - declined;

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const fd = new FormData();
    fd.set("partyId", deleteTarget.id);
    await deleteGuestAction(fd);
    setDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form className="relative flex-1 min-w-[16rem] max-w-md" action="">
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
        <Button onClick={() => setAddOpen(true)} variant="primary" size="default">
          <UserPlus className="h-4 w-4" />
          Add Guest
        </Button>
        <Button onClick={() => setBulkOpen(true)} variant="secondary" size="default">
          <Upload className="h-4 w-4" />
          Bulk Add
        </Button>
        <a href="/admin/guests/export">
          <Button variant="outline" size="default">
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

      {/* Guest list */}
      {parties.length === 0 ? (
        <div className="rounded-2xl border border-blush/20 bg-paper/60 py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted-ink/40" aria-hidden />
          <p className="text-sm text-muted-ink">
            No guests found. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {parties.map((party) => {
            const guest = (party.invitees ?? []).find((g) => g.is_active);
            const activePass = (party.qr_passes ?? []).find(
              (p) => p.status === "active",
            );
            if (!guest) return null;
            return (
              <article
                key={party.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blush/15 bg-paper/80 px-5 py-4 transition-colors hover:bg-blush-light/15"
              >
                <div className="min-w-[12rem] flex-1">
                  <p className="font-semibold text-ink">{guest.full_name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-ink">
                    <Mail className="h-3 w-3" aria-hidden />
                    {party.email || "No email"}
                  </p>
                </div>

                <StatusPill status={guest.rsvp_status} />

                {/* Inline status override */}
                <form
                  action={adminRsvpOverrideAction}
                  className="flex items-center gap-2"
                  onChange={(e) => e.currentTarget.requestSubmit()}
                >
                  <input type="hidden" name="inviteeId" value={guest.id} />
                  <input
                    type="hidden"
                    name="reason"
                    value="Manual status update by admin"
                  />
                  <Select
                    name="status"
                    defaultValue={guest.rsvp_status}
                    aria-label={`Set status for ${guest.full_name}`}
                    className="min-h-9 w-40 py-1.5 text-xs"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </form>

                {/* Pass + delete actions */}
                <div className="flex items-center gap-1.5">
                  {activePass ? (
                    <form action={revokePassAction}>
                      <input type="hidden" name="passId" value={activePass.id} />
                      <Button
                        type="submit"
                        size="icon"
                        variant="outline"
                        title="Revoke pass"
                        aria-label="Revoke pass"
                        className="h-9 w-9"
                      >
                        <TicketX className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : guest.rsvp_status === "attending" ? (
                    <form action={reissuePassAction}>
                      <input type="hidden" name="inviteeId" value={guest.id} />
                      <Button
                        type="submit"
                        size="icon"
                        variant="outline"
                        title="Issue pass"
                        aria-label="Issue pass"
                        className="h-9 w-9"
                      >
                        <Ticket className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : null}
                  <Button
                    onClick={() => setDeleteTarget(party)}
                    size="icon"
                    variant="ghost"
                    title="Delete guest"
                    aria-label="Delete guest"
                    className="h-9 w-9 text-danger hover:bg-[rgba(176,48,80,0.08)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

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

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        pending={deleting}
        title="Delete this guest?"
        confirmLabel="Delete guest"
        message={
          <>
            <strong>{deleteTarget?.display_name}</strong> and their passes and
            check-in history will be permanently removed. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
