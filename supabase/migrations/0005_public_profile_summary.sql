create or replace function public.get_public_profile_summary(p_ids uuid[])
returns table (
  id uuid,
  full_name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select profiles.id, profiles.full_name, profiles.avatar_url
  from public.profiles as profiles
  where profiles.id = any(coalesce(p_ids, '{}'::uuid[]));
$$;

grant execute on function public.get_public_profile_summary(uuid[]) to authenticated, anon, service_role;
