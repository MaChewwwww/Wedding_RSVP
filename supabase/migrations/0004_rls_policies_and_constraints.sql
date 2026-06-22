-- 0004_rls_policies_and_constraints.sql
-- Admin RLS policies + transactional capacity guard
-- (docs/security-and-privacy.md "Authorization and RLS").
--
-- Guest operations never touch these tables directly — they go through
-- server-only code using the service role (which bypasses RLS). These policies
-- exist so that if any table is ever reached via the authenticated Data API,
-- only an active admin can read/write. Anonymous users get nothing.

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.is_active
  );
$$;

-- Admin full access on operational tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_profiles','invitation_parties','invitees','invitee_aliases',
    'guest_sessions','qr_passes','tables','attendance_events',
    'email_deliveries','audit_logs'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_active_admin()) with check (public.is_active_admin());',
      'admin_all_' || t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Transactional table-capacity guard (docs/data-model.md constraints,
-- docs/testing.md "Concurrent table assignments cannot exceed capacity").
-- Locks the target table row, then rejects an assignment that would exceed
-- capacity. Declined invitees may not hold a table assignment.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_table_capacity()
returns trigger
language plpgsql
as $$
declare
  cap integer;
  assigned integer;
begin
  if new.table_id is null then
    return new;
  end if;

  if new.rsvp_status = 'declined' then
    raise exception 'A declined invitee cannot be assigned to a table.';
  end if;

  -- Lock the table row to serialize concurrent assignments.
  select capacity into cap from public.tables where id = new.table_id for update;
  if cap is null then
    raise exception 'Target table does not exist.';
  end if;

  select count(*) into assigned
  from public.invitees
  where table_id = new.table_id
    and is_active
    and rsvp_status = 'attending'
    and id <> new.id;

  if assigned + 1 > cap then
    raise exception 'Table % is at capacity (%).', new.table_id, cap;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_table_capacity
  before insert or update of table_id, rsvp_status on public.invitees
  for each row execute function public.enforce_table_capacity();
