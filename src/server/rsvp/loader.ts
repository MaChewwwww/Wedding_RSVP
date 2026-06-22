import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGuestPartyId } from "@/server/session/guest-session";

/*
  Loads the current guest's party + invitees for the RSVP/celebration pages,
  scoped strictly to the validated guest session (docs/user-flows.md). Returns
  null when there is no valid session or the backend is not configured.
*/

export type GuestView = {
  id: string;
  fullName: string;
  rsvpStatus: "pending" | "attending" | "declined";
};

export type PartyView = {
  id: string;
  rsvpStatus: "pending" | "attending" | "declined" | "undecided";
  email: string | null;
  guest: GuestView;
};

export async function loadCurrentParty(): Promise<PartyView | null> {
  const partyId = await getGuestPartyId();
  if (!partyId) return null;

  const db = createAdminClient();
  if (!db) return null;

  const { data: party } = await db
    .from("invitation_parties")
    .select("id, rsvp_status, email")
    .eq("id", partyId)
    .single();
  if (!party) return null;

  const { data: guest } = await db
    .from("invitees")
    .select("id, full_name, rsvp_status")
    .eq("party_id", partyId)
    .eq("is_active", true)
    .single();
  if (!guest) return null;

  return {
    id: party.id,
    rsvpStatus: party.rsvp_status,
    email: party.email,
    guest: {
      id: guest.id,
      fullName: guest.full_name,
      rsvpStatus: guest.rsvp_status,
    },
  };
}
