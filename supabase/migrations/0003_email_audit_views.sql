-- 0003_email_audit_views.sql
-- Email delivery tracking, audit log, and derived views (docs/data-model.md).

-- ---------------------------------------------------------------------------
-- email_deliveries (docs/data-model.md).
-- ---------------------------------------------------------------------------
create type public.email_purpose as enum ('initial_pass', 'resend', 'update');
create type public.email_status as enum (
  'queued', 'sent', 'delivered', 'bounced', 'failed', 'complained'
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.invitation_parties(id) on delete cascade,
  recipient_email text not null,
  purpose public.email_purpose not null,
  provider_message_id text,
  status public.email_status not null default 'queued',
  error_code text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create trigger trg_email_updated
  before update on public.email_deliveries
  for each row execute function public.set_updated_at();

create index idx_email_party on public.email_deliveries(party_id);

-- ---------------------------------------------------------------------------
-- audit_logs (docs/data-model.md). before/after minimized JSON; exclude secrets.
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  "before" jsonb,
  "after" jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_created on public.audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- Derived views.
-- ---------------------------------------------------------------------------

-- Current check-in state per invitee, derived from the append-only event log.
-- The most recent event per invitee determines presence.
create view public.invitee_attendance_current as
select
  i.id as invitee_id,
  i.party_id,
  coalesce(latest.event_type = 'checked_in', false) as is_checked_in,
  latest.occurred_at as last_event_at
from public.invitees i
left join lateral (
  select ae.event_type, ae.occurred_at
  from public.attendance_events ae
  where ae.invitee_id = i.id
  order by ae.occurred_at desc
  limit 1
) latest on true;

-- Table capacity with assigned/remaining seats (attending invitees only).
create view public.table_capacity as
select
  t.id as table_id,
  t.name,
  t.capacity,
  count(i.id) filter (where i.rsvp_status = 'attending') as assigned,
  t.capacity - count(i.id) filter (where i.rsvp_status = 'attending') as remaining
from public.tables t
left join public.invitees i on i.table_id = t.id and i.is_active
group by t.id, t.name, t.capacity;

alter table public.email_deliveries enable row level security;
alter table public.audit_logs enable row level security;
