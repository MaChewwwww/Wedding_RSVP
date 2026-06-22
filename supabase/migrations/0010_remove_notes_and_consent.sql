-- 0010_remove_notes_and_consent.sql
-- Drop notes and email_consent_at columns and clean up submit_rsvp function.

-- 1. Remove columns from database
alter table public.invitation_parties
  drop column if exists notes,
  drop column if exists email_consent_at;

alter table public.invitees
  drop column if exists dietary_notes;

-- 2. Drop the old submit_rsvp RPC signature
drop function if exists public.submit_rsvp(uuid, jsonb, text, boolean, text, jsonb, text);

-- 3. Create the new submit_rsvp RPC without consent and notes
create or replace function public.submit_rsvp(
  p_party_id uuid,
  p_responses jsonb,
  p_email text,
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

  select status into v_party_state
  from public.invitation_parties where id = p_party_id for update;

  if v_party_state is null or v_party_state <> 'active' then
    raise exception 'Invitation party is not active.';
  end if;

  select count(*) into v_active_count
  from public.invitees where party_id = p_party_id and is_active;

  select count(*), count(distinct response."inviteeId"), count(i.id)
  into v_total, v_distinct, v_matching
  from jsonb_to_recordset(p_responses)
    as response("inviteeId" text, attendance text)
  left join public.invitees i
    on i.id = response."inviteeId"::uuid
   and i.party_id = p_party_id and i.is_active
  where response.attendance in ('attending', 'declined', 'undecided');

  if v_total <> jsonb_array_length(p_responses)
     or v_total <> v_distinct
     or v_matching <> v_total
     or v_total <> v_active_count then
    raise exception 'Invitee responses do not match the active invitation party.';
  end if;

  select count(*) filter (where attendance = 'attending'),
         count(*) filter (where attendance = 'declined')
  into v_attending, v_declined
  from jsonb_to_recordset(p_responses)
    as response("inviteeId" text, attendance text);

  if v_total <> 1 or v_active_count <> 1 then
    raise exception 'Each invitation must contain exactly one guest.';
  end if;

  for resp in select * from jsonb_array_elements(p_responses)
  loop
    update public.invitees
    set rsvp_status = case
          when resp->>'attendance' = 'attending' then 'attending'::public.invitee_rsvp_status
          when resp->>'attendance' = 'declined' then 'declined'::public.invitee_rsvp_status
          else 'pending'::public.invitee_rsvp_status
        end,
        table_id = case when resp->>'attendance' = 'declined' then null else table_id end
    where id = (resp->>'inviteeId')::uuid and party_id = p_party_id;
  end loop;

  v_party_status := case
    when v_attending > 0 then 'attending'::public.rsvp_status
    when v_declined = v_total then 'declined'::public.rsvp_status
    else 'undecided'::public.rsvp_status
  end;

  update public.invitation_parties
  set rsvp_status = v_party_status,
      email = coalesce(p_email, email),
      responded_at = now()
  where id = p_party_id;

  for pass in select * from jsonb_array_elements(p_passes)
  loop
    insert into public.qr_passes
      (invitee_id, party_id, token_hash, token_ciphertext, status)
    select
      (pass->>'inviteeId')::uuid,
      p_party_id,
      pass->>'tokenHash',
      pass->>'tokenCiphertext',
      'active'
    where exists (
      select 1 from public.invitees i
      where i.id = (pass->>'inviteeId')::uuid
        and i.party_id = p_party_id
        and i.is_active
        and i.rsvp_status = 'attending'
    )
    on conflict (invitee_id) where invitee_id is not null and status = 'active'
    do nothing;
  end loop;

  insert into public.audit_logs
    (action, entity_type, entity_id, "after", request_id)
  values (
    'rsvp_submitted',
    'invitation_party',
    p_party_id,
    jsonb_build_object(
      'rsvp_status', v_party_status,
      'email', p_email
    ),
    p_request_id
  );
end;
$$;

-- 4. Harden execution permissions
revoke all on function public.submit_rsvp(uuid, jsonb, text, jsonb, text) from public, anon;
