import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PartyConfirmation = {
  guestName: string;
};

export async function loadPartyConfirmation(
  partyId: string,
): Promise<PartyConfirmation | null> {
  const db = createAdminClient();
  if (!db) return null;

  const { data: party } = await db
    .from("invitation_parties")
    .select("status")
    .eq("id", partyId)
    .single();
  if (!party || party.status !== "active") return null;

  const { data: guest } = await db
    .from("invitees")
    .select("full_name")
    .eq("party_id", partyId)
    .eq("is_active", true)
    .single();
  if (!guest) return null;

  return {
    guestName: guest.full_name,
  };
}
