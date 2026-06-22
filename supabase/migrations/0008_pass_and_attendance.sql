-- 0008_pass_and_attendance.sql
-- Recoverable encrypted QR payloads plus atomic attendance operations.

alter table public.qr_passes
  add column if not exists token_ciphertext text;

create unique index if not exists idx_qr_one_active_invitee
  on public.qr_passes(invitee_id)
  where invitee_id is not null and status = 'active';

create or replace view public.table_capacity as
select
  t.id as table_id,
  t.name,
  t.capacity,
  count(i.id) filter (where i.rsvp_status = 'attending') as assigned,
  t.capacity - count(i.id) filter (where i.rsvp_status = 'attending') as remaining,
  t.is_active
from public.tables t
left join public.invitees i on i.table_id = t.id and i.is_active
group by t.id, t.name, t.capacity, t.is_active;

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
      email_consent_at = case
        when p_email is not null and p_email_consent then now()
        else email_consent_at end,
      notes = coalesce(p_notes, notes),
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
    'rsvp.submit', 'invitation_party', p_party_id::text,
    jsonb_build_object('rsvp_status', v_party_status, 'attending', v_attending),
    p_request_id
  );
end;
$$;

create or replace function public.record_attendance(
  p_invitee_id uuid,
  p_event_type public.attendance_event_type,
  p_method public.attendance_method,
  p_performed_by uuid,
  p_request_id text,
  p_reason text default null,
  p_device_meta jsonb default null
)
returns table(result text, occurred_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_event public.attendance_event_type;
  event_time timestamptz;
begin
  perform 1 from public.invitees where id = p_invitee_id for update;

  select ae.event_type into current_event
  from public.attendance_events ae
  where ae.invitee_id = p_invitee_id
  order by ae.occurred_at desc
  limit 1;

  if p_event_type = 'checked_in' and current_event = 'checked_in' then
    return query
      select 'already_checked_in'::text, ae.occurred_at
      from public.attendance_events ae
      where ae.invitee_id = p_invitee_id
      order by ae.occurred_at desc limit 1;
    return;
  end if;

  if p_event_type = 'check_in_reversed' then
    if current_event is distinct from 'checked_in' then
      return query select 'not_checked_in'::text, null::timestamptz;
      return;
    end if;
    if coalesce(trim(p_reason), '') = '' then
      raise exception 'A reversal reason is required.';
    end if;
  end if;

  insert into public.attendance_events
    (invitee_id, event_type, method, performed_by, request_id, reason, device_meta)
  values
    (p_invitee_id, p_event_type, p_method, p_performed_by, p_request_id, p_reason, p_device_meta)
  on conflict (request_id) do nothing
  returning attendance_events.occurred_at into event_time;

  return query select
    case when p_event_type = 'checked_in' then 'checked_in' else 'reversed' end,
    event_time;
end;
$$;

revoke all on function public.record_attendance(
  uuid, public.attendance_event_type, public.attendance_method, uuid, text, text, jsonb
) from public, anon;
