-- 0009_single_guest_invitations.sql
-- Product policy: every invitation is strictly for one named guest.
--
-- Existing projects must resolve any party containing more than one invitee
-- before applying this migration. The migration refuses to choose or delete
-- guests automatically.

do $$
begin
  if exists (
    select p.id
    from public.invitation_parties p
    left join public.invitees i on i.party_id = p.id
    group by p.id
    having count(i.id) <> 1
  ) then
    raise exception
      'Every invitation party must contain exactly one invitee before applying migration 0009.';
  end if;
end;
$$;

update public.invitation_parties p
set display_name = i.full_name
from public.invitees i
where i.party_id = p.id;

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

drop trigger if exists trg_sync_invitation_display_name on public.invitees;
create trigger trg_sync_invitation_display_name
  after insert or update of full_name on public.invitees
  for each row execute function public.sync_invitation_display_name();

alter table public.invitation_parties
  drop column if exists max_attendees,
  drop column if exists allow_plus_one;

create unique index if not exists idx_invitees_one_per_party
  on public.invitees(party_id);

alter table public.invitees
  drop column if exists is_primary_contact,
  drop column if exists is_named_guest,
  drop column if exists sort_order;

alter table public.qr_passes
  add constraint qr_passes_require_invitee
    check (invitee_id is not null);

alter table public.attendance_events
  add constraint attendance_events_require_invitee
    check (invitee_id is not null);
