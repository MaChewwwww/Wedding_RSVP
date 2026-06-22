-- 0005_match_rpc.sql
-- SECURITY DEFINER fuzzy-match function (docs/tech-stack.md: keep fuzzy-match
-- functions in a non-exposed schema or call them only through protected server
-- code). This RPC runs pg_trgm similarity server-side and returns a small,
-- capped candidate set. It is owned by a privileged role; revoke from anon.

create or replace function public.match_invitees(query text, match_limit integer default 5)
returns table (
  invitee_id uuid,
  party_id uuid,
  normalized_name text,
  is_active boolean,
  party_status public.party_status,
  similarity real
)
language sql
security definer
set search_path = public
as $$
  select
    i.id,
    i.party_id,
    i.normalized_name,
    i.is_active,
    p.status,
    similarity(i.normalized_name, query) as similarity
  from public.invitees i
  join public.invitation_parties p on p.id = i.party_id
  where i.is_active
    and p.status = 'active'
    and i.normalized_name % query        -- trigram similarity threshold (pg_trgm)
  order by similarity desc
  limit greatest(1, least(match_limit, 25));
$$;

-- Only the service role / authenticated admin path should call this.
revoke all on function public.match_invitees(text, integer) from public, anon;
