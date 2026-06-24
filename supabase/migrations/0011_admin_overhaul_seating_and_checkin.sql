-- 0011_admin_overhaul_seating_and_checkin.sql
-- Admin portal overhaul: let any active guest be seated and checked in,
-- regardless of RSVP status. The couple seats guests before they RSVP and
-- manually checks in non-techy guests on the day. Capacity is still enforced.
--
-- Changes:
--   1. enforce_table_capacity() — drop the attending-only / declined-block
--      rules; count every active invitee at the table for capacity.
--   2. table_capacity view — count every active assigned invitee, not just
--      attending, so seat math matches the new seating rule.
-- record_attendance() already ignores rsvp_status; the previous gating lived
-- in the app layer (relaxed separately), so the RPC is unchanged here.

-- ---------------------------------------------------------------------------
-- Capacity guard: any active invitee may hold a seat; capacity still enforced.
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

  -- Lock the table row to serialize concurrent assignments.
  select capacity into cap from public.tables where id = new.table_id for update;
  if cap is null then
    raise exception 'Target table does not exist.';
  end if;

  select count(*) into assigned
  from public.invitees
  where table_id = new.table_id
    and is_active
    and id <> new.id;

  if assigned + 1 > cap then
    raise exception 'Table % is at capacity (%).', new.table_id, cap;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Capacity view: assigned/remaining count every active seated invitee.
-- ---------------------------------------------------------------------------
create or replace view public.table_capacity as
select
  t.id as table_id,
  t.name,
  t.capacity,
  count(i.id) as assigned,
  t.capacity - count(i.id) as remaining,
  t.is_active
from public.tables t
left join public.invitees i on i.table_id = t.id and i.is_active
group by t.id, t.name, t.capacity, t.is_active;
