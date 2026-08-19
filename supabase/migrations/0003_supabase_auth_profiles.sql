create extension if not exists pgcrypto;

alter table public.profiles
  alter column clerk_user_id drop not null;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists avatar_url text;

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typnamespace = 'public'::regnamespace
      and t.typname = 'user_role'
      and e.enumlabel = 'vendor'
  ) and not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typnamespace = 'public'::regnamespace
      and t.typname = 'user_role'
      and e.enumlabel = 'provider'
  ) then
    alter type public.user_role rename value 'vendor' to 'provider';
  end if;
end $$;

update public.profiles
set role = 'provider'
where role::text = 'vendor';

alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type text using role::text;

alter table public.profiles
  alter column role set default 'tourist';

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('tourist', 'provider', 'admin'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade not valid;
  end if;
end $$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
begin
  new_role := coalesce(new.raw_user_meta_data->>'role', 'tourist');

  if new_role = 'vendor' then
    new_role := 'provider';
  end if;

  if new_role not in ('tourist', 'provider', 'admin') then
    new_role := 'tourist';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    phone,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      new.email
    ),
    new.email,
    new_role,
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

create or replace function public.get_current_profile_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

grant execute on function public.get_current_profile_role() to authenticated, anon, service_role;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = public.get_current_profile_role()
);
