-- seed.sql — synthetic development data (docs/configuration.md: never use
-- production guest data in non-production). All names below are fictional.
-- normalized_name values follow src/server/matching/normalize.ts rules.
-- Invitation-code hashes are intentionally omitted here because they require
-- the server-only INVITATION_CODE_PEPPER. Use `pnpm seed` to seed test codes.

insert into public.invitation_parties (id, display_name, status, rsvp_status)
values
  ('11111111-1111-4111-8111-111111111111', 'Maria Dela Cruz', 'active', 'pending'),
  ('22222222-2222-4222-8222-222222222222', 'Maria Santos', 'active', 'pending'),
  ('33333333-3333-4333-8333-333333333333', 'Juan Reyes', 'active', 'pending');

insert into public.invitees (id, party_id, full_name, normalized_name)
values
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Maria Dela Cruz', 'maria dela cruz'),
  ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Maria Santos', 'maria santos'),
  ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Juan Reyes', 'juan reyes');

insert into public.invitee_aliases (invitee_id, alias, normalized_alias, source)
select id, 'Mary Dela Cruz', 'mary dela cruz', 'admin'
from public.invitees where normalized_name = 'maria dela cruz' limit 1;

insert into public.tables (name, capacity, sort_order)
values ('Table 1', 8, 0), ('Table 2', 8, 1), ('Head Table', 6, 2);
