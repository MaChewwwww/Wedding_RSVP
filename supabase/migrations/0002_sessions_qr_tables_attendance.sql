-- 0002_sessions_qr_tables_attendance.sql
-- Guest sessions, QR passes, seating tables, attendance events
-- (docs/data-model.md). RLS enabled deny-by-default throughout.

-- ---------------------------------------------------------------------------
-- guest_sessions: short-lived, party-scoped (docs/architecture.md).
-- ---------------------------------------------------------------------------
create table public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.invitation_parties(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_ip_hash text,                -- minimized abuse signal, not raw IP
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_sessions_updated
  before update on public.guest_sessions
  for each row execute function public.set_updated_at();

create index idx_sessions_party on public.guest_sessions(party_id);

-- ---------------------------------------------------------------------------
-- tables: seating (docs/data-model.md). Created before qr_passes/attendance
-- so invitees.table_id FK can be added.
-- ---------------------------------------------------------------------------
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity integer not null check (capacity > 0),
  location_note text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tables_updated
  before update on public.tables
  for each row execute function public.set_updated_at();

alter table public.invitees
  add constraint fk_invitees_table
  foreign key (table_id) references public.tables(id) on delete set null;

-- ---------------------------------------------------------------------------
-- qr_passes: opaque, revocable (docs/data-model.md). CHECK_IN_MODE=invitee
-- default => one pass per invitee, but party_id retained to support both.
-- ---------------------------------------------------------------------------
create type public.qr_status as enum ('active', 'revoked', 'replaced');

create table public.qr_passes (
  id uuid primary key default gen_random_uuid(),
  party_id uuid references public.invitation_parties(id) on delete cascade,
  invitee_id uuid references public.invitees(id) on delete cascade,
  token_hash text not null unique,
  status public.qr_status not null default 'active',
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  replaced_by_id uuid references public.qr_passes(id),
  -- A pass must reference at least one subject.
  constraint chk_qr_subject check (party_id is not null or invitee_id is not null)
);

create index idx_qr_party on public.qr_passes(party_id);
create index idx_qr_invitee on public.qr_passes(invitee_id);

-- ---------------------------------------------------------------------------
-- attendance_events: append-only audit source (docs/data-model.md).
-- ---------------------------------------------------------------------------
create type public.attendance_event_type as enum ('checked_in', 'check_in_reversed');
create type public.attendance_method as enum ('qr', 'manual');

create table public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  invitee_id uuid references public.invitees(id) on delete cascade,
  party_id uuid references public.invitation_parties(id) on delete cascade,
  event_type public.attendance_event_type not null,
  method public.attendance_method not null,
  performed_by uuid references auth.users(id),
  occurred_at timestamptz not null default now(),
  reason text,                         -- required for reversal (enforced in app)
  request_id text not null unique,     -- idempotency / correlation key
  device_meta jsonb,
  constraint chk_attendance_subject check (invitee_id is not null or party_id is not null)
);

create index idx_attendance_invitee on public.attendance_events(invitee_id);
create index idx_attendance_party on public.attendance_events(party_id);

alter table public.guest_sessions enable row level security;
alter table public.tables enable row level security;
alter table public.qr_passes enable row level security;
alter table public.attendance_events enable row level security;
