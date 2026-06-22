-- 0007_phase2_hardening.sql
-- Invitation-code uniqueness and defense-in-depth RSVP membership validation.

create unique index if not exists idx_parties_invitation_code_hash
  on public.invitation_parties(invitation_code_hash)
  where invitation_code_hash is not null;

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
  v_declined int := 0;
  v_total int := 0;
  v_distinct int := 0;
  v_matching int := 0;
  v_active_count int := 0;
  v_party_state public.party_status;
  v_party_status public.rsvp_status;
begin
  if jsonb_typeof(p_responses) <> 'array' or jsonb_array_length(p_responses) = 0 then
    raise exception 'At least one invitee response is required.';
  end if;

  select status
    into v_party_state
  from public.invitation_parties
  where id = p_party_id
  for update;

  if v_party_state is null or v_party_state <> 'active' then
    raise exception 'Invitation party is not active.';
  end if;

  select count(*) into v_active_count
  from public.invitees
  where party_id = p_party_id and is_active;

  select
    count(*),
    count(distinct response."inviteeId"),
    count(i.id)
  into v_total, v_distinct, v_matching
  from jsonb_to_recordset(p_responses)
    as response("inviteeId" text, attendance text)
  left join public.invitees i
    on i.id = response."inviteeId"::uuid
   and i.party_id = p_party_id
   and i.is_active
  where response.attendance in ('attending', 'declined', 'undecided');

  if v_total <> jsonb_array_length(p_responses)
     or v_total <> v_distinct
     or v_matching <> v_total
     or v_total <> v_active_count then
    raise exception 'Invitee responses do not match the active invitation party.';
  end if;

  select count(*) into v_attending
  from jsonb_to_recordset(p_responses)
    as response("inviteeId" text, attendance text)
  where response.attendance = 'attending';

  select count(*) into v_declined
  from jsonb_to_recordset(p_responses)
    as response("inviteeId" text, attendance text)
  where response.attendance = 'declined';

  if v_total <> 1 or v_active_count <> 1 then
    raise exception 'Each invitation must contain exactly one guest.';
  end if;

  for resp in select * from jsonb_array_elements(p_responses)
  loop
    if (resp->>'attendance') = 'attending' then
      update public.invitees
        set rsvp_status = 'attending'
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    elsif (resp->>'attendance') = 'declined' then
      update public.invitees
        set rsvp_status = 'declined', table_id = null
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    else
      update public.invitees
        set rsvp_status = 'pending'
        where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
    end if;
  end loop;

  if v_attending > 0 then
    v_party_status := 'attending';
  elsif v_declined = v_total then
    v_party_status := 'declined';
  else
    v_party_status := 'undecided';
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

  for pass in select * from jsonb_array_elements(p_passes)
  loop
    insert into public.qr_passes (invitee_id, party_id, token_hash, status)
    select (pass->>'inviteeId')::uuid, p_party_id, pass->>'tokenHash', 'active'
    where exists (
      select 1 from public.invitees i
      where i.id = (pass->>'inviteeId')::uuid
        and i.party_id = p_party_id
        and i.is_active
        and i.rsvp_status = 'attending'
    )
    and not exists (
      select 1 from public.qr_passes q
      where q.invitee_id = (pass->>'inviteeId')::uuid and q.status = 'active'
    );
  end loop;

  insert into public.audit_logs (action, entity_type, entity_id, "after", request_id)
  values (
    'rsvp.submit', 'invitation_party', p_party_id::text,
    jsonb_build_object('rsvp_status', v_party_status, 'attending', v_attending),
    p_request_id
  );
end;
$$;

revoke all on function public.submit_rsvp(uuid, jsonb, text, boolean, text, jsonb, text)
  from public, anon;
