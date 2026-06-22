-- 0001_extensions_and_core.sql
-- Extensions + core guest entities (docs/data-model.md).
-- Authored for the implementation phase; apply via the Supabase CLI once a
-- project is provisioned. RLS is enabled deny-by-default on every table; access
-- flows through server-only code using the service role, never the anon key.

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- trigram name similarity

-- Reusable updated_at trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_profiles: extends auth.users (docs/data-model.md).
-- ---------------------------------------------------------------------------
create type public.admin_role as enum ('admin', 'check_in_staff');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'admin',
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_admin_profiles_updated
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invitation_parties: one authorization/session boundary per named guest.
-- ---------------------------------------------------------------------------
create type public.party_status as enum ('active', 'archived');
create type public.rsvp_status as enum ('pending', 'attending', 'declined', 'undecided');

create table public.invitation_parties (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  invitation_code_hash text,
  status public.party_status not null default 'active',
  rsvp_status public.rsvp_status not null default 'pending',
  email text,
  email_consent_at timestamptz,
  notes text,                          -- access-restricted guest note
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_parties_updated
  before update on public.invitation_parties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invitees: each named person; non-atomic full_name + maintained normalized.
-- ---------------------------------------------------------------------------
create type public.invitee_rsvp_status as enum ('pending', 'attending', 'declined');

create table public.invitees (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.invitation_parties(id) on delete cascade,
  full_name text not null,
  normalized_name text not null,
  rsvp_status public.invitee_rsvp_status not null default 'pending',
  dietary_notes text,
  table_id uuid,                       -- FK added after tables in 0002
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_invitees_updated
  before update on public.invitees
  for each row execute function public.set_updated_at();

create or replace function public.sync_invitation_display_name()
returns trigger
language plpgsql
as $$
begin
  update public.invitation_parties
  set display_name = new.full_name
  where id = new.party_id;
  return new;
end;
$$;

create trigger trg_sync_invitation_display_name
  after insert or update of full_name on public.invitees
  for each row execute function public.sync_invitation_display_name();

create index idx_invitees_party on public.invitees(party_id);
create unique index idx_invitees_one_per_party on public.invitees(party_id);
create index idx_invitees_status on public.invitees(rsvp_status);
create index idx_invitees_table on public.invitees(table_id);
-- GIN trigram index for fuzzy candidate search.
create index idx_invitees_normalized_trgm
  on public.invitees using gin (normalized_name gin_trgm_ops);
-- Non-unique duplicate-review index.
create index idx_invitees_normalized on public.invitees(normalized_name);

-- ---------------------------------------------------------------------------
-- invitee_aliases: nicknames, maiden names, spelling/transliteration variants.
-- ---------------------------------------------------------------------------
create type public.alias_source as enum ('admin', 'import');

create table public.invitee_aliases (
  id uuid primary key default gen_random_uuid(),
  invitee_id uuid not null references public.invitees(id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  source public.alias_source not null default 'admin',
  created_at timestamptz not null default now()
);

create index idx_aliases_invitee on public.invitee_aliases(invitee_id);
create index idx_aliases_normalized_trgm
  on public.invitee_aliases using gin (normalized_alias gin_trgm_ops);

-- Enable RLS deny-by-default; no policies => no anon/auth direct access.
alter table public.admin_profiles enable row level security;
alter table public.invitation_parties enable row level security;
alter table public.invitees enable row level security;
alter table public.invitee_aliases enable row level security;
