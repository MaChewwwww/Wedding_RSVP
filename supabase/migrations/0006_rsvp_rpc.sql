-- 0006_rsvp_rpc.sql
-- Atomic RSVP commit (docs/architecture.md "RSVP transaction"). Runs as one
-- transaction: updates the party, per-invitee attendance, issues QR passes for
-- attending invitees if absent, and writes an audit event. The deadline check
-- and authorization happen in the server orchestrator BEFORE this is called;
-- this function is the atomic data step. SECURITY DEFINER; not exposed to anon.

create or replace function public.submit_rsvp(
  p_party_id uuid,
  p_responses jsonb,
  p_email text,
  p_email_consent boolean,
  p_notes text,
  p_passes jsonb,
  p_request_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  resp jsonb;
  pass jsonb;
  v_attending int := 0;
  v_total int := 0;
  v_party_status public.rsvp_status;
begin
  -- Lock the party row for the duration of the transaction.
  perform 1 from public.invitation_parties where id = p_party_id for update;

  -- Per-invitee attendance.
  for resp in select * from jsonb_array_elements(p_responses)
  loop
    v_total := v_total + 1;
    if (resp->>'attendance') = 'attending' then
      v_attending := v_attending + 1;
      update public.invitees
        set rsvp_status = 'attending'
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    elsif (resp->>'attendance') = 'declined' then
      update public.invitees
        set rsvp_status = 'declined', table_id = null  -- declined keeps no seat
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    else
      update public.invitees
        set rsvp_status = 'pending'
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    end if;
  end loop;

  -- Roll up to party-level status.
  if v_attending > 0 then
    v_party_status := 'attending';
  elsif v_attending = 0 and v_total > 0 then
    v_party_status := 'declined';
  else
    v_party_status := 'pending';
  end if;

  update public.invitation_parties
    set rsvp_status = v_party_status,
        email = coalesce(p_email, email),
        email_consent_at = case
          when p_email is not null and p_email_consent then now()
          else email_consent_at end,
        notes = coalesce(p_notes, notes),
        responded_at = now()
    where id = p_party_id;

  -- Issue a QR pass per attending invitee if one does not already exist.
  for pass in select * from jsonb_array_elements(p_passes)
  loop
    insert into public.qr_passes (invitee_id, party_id, token_hash, status)
    select (pass->>'inviteeId')::uuid, p_party_id, pass->>'tokenHash', 'active'
    where not exists (
      select 1 from public.qr_passes q
      where q.invitee_id = (pass->>'inviteeId')::uuid and q.status = 'active'
    );
  end loop;

  -- Audit event (before/after minimized; no secrets).
  insert into public.audit_logs (action, entity_type, entity_id, "after", request_id)
  values (
    'rsvp.submit', 'invitation_party', p_party_id::text,
    jsonb_build_object('rsvp_status', v_party_status, 'attending', v_attending),
    p_request_id
  );
end;
$$;

revoke all on function public.submit_rsvp(uuid, jsonb, text, boolean, text, jsonb, text) from public, anon;
