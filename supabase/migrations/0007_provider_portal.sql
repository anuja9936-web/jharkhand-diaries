create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists business_name text,
  add column if not exists owner_name text,
  add column if not exists description text,
  add column if not exists address text,
  add column if not exists district text,
  add column if not exists state text,
  add column if not exists website_url text,
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists provider_categories text[] not null default '{}'::text[],
  add column if not exists profile_image_url text,
  add column if not exists cover_image_url text;

create table if not exists public.provider_offerings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('product', 'experience', 'stay')),
  name text not null,
  slug text not null,
  short_description text,
  description text,
  category text,
  district text,
  address text,
  price numeric,
  currency text not null default 'INR',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cover_image text,
  gallery text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, kind, slug)
);

create index if not exists provider_offerings_provider_id_idx on public.provider_offerings (provider_id);
create index if not exists provider_offerings_kind_idx on public.provider_offerings (kind);
create index if not exists provider_offerings_status_idx on public.provider_offerings (status);

create table if not exists public.provider_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users (id) on delete cascade,
  offering_id uuid references public.provider_offerings (id) on delete cascade,
  request_type text not null check (request_type in ('learning', 'booking', 'order')),
  tourist_id uuid references auth.users (id) on delete set null,
  tourist_name text not null,
  tourist_email text,
  preferred_date date,
  duration text,
  participants integer not null default 1 check (participants > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_requests_provider_id_idx on public.provider_requests (provider_id);
create index if not exists provider_requests_offering_id_idx on public.provider_requests (offering_id);
create index if not exists provider_requests_status_idx on public.provider_requests (status);

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_provider_offerings_updated_at on public.provider_offerings;
create trigger set_provider_offerings_updated_at
before update on public.provider_offerings
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_provider_requests_updated_at on public.provider_requests;
create trigger set_provider_requests_updated_at
before update on public.provider_requests
for each row
execute function public.set_row_updated_at();

create or replace function public.get_public_provider_profile(provider_user_id uuid)
returns table (
  id uuid,
  full_name text,
  business_name text,
  owner_name text,
  description text,
  phone text,
  avatar_url text,
  cover_image_url text,
  address text,
  district text,
  state text,
  website_url text,
  provider_categories text[],
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.business_name,
    p.owner_name,
    p.description,
    p.phone,
    p.avatar_url,
    p.cover_image_url,
    p.address,
    p.district,
    p.state,
    p.website_url,
    p.provider_categories,
    p.created_at
  from public.profiles p
  where p.id = provider_user_id
    and p.role = 'provider';
$$;

grant execute on function public.get_public_provider_profile(uuid) to anon, authenticated, service_role;

alter table public.provider_offerings enable row level security;
alter table public.provider_requests enable row level security;

drop policy if exists "Public can read published provider offerings" on public.provider_offerings;
create policy "Public can read published provider offerings"
on public.provider_offerings
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Providers can view own offerings" on public.provider_offerings;
create policy "Providers can view own offerings"
on public.provider_offerings
for select
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can insert own offerings" on public.provider_offerings;
create policy "Providers can insert own offerings"
on public.provider_offerings
for insert
to authenticated
with check (
  provider_id = auth.uid()
  and public.get_current_profile_role() = 'provider'
);

drop policy if exists "Providers can update own offerings" on public.provider_offerings;
create policy "Providers can update own offerings"
on public.provider_offerings
for update
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
)
with check (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can delete own offerings" on public.provider_offerings;
create policy "Providers can delete own offerings"
on public.provider_offerings
for delete
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can read own requests" on public.provider_requests;
create policy "Providers can read own requests"
on public.provider_requests
for select
to authenticated
using (
  provider_id = auth.uid()
  or tourist_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can manage own requests" on public.provider_requests;
create policy "Providers can manage own requests"
on public.provider_requests
for update
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
)
with check (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Tourists can create provider requests" on public.provider_requests;
create policy "Tourists can create provider requests"
on public.provider_requests
for insert
to authenticated
with check (
  tourist_id = auth.uid()
  and public.get_current_profile_role() = 'tourist'
);

drop policy if exists "Tourists can read their own requests" on public.provider_requests;
create policy "Tourists can read their own requests"
on public.provider_requests
for select
to authenticated
using (
  tourist_id = auth.uid()
  or provider_id = auth.uid()
  or public.is_admin_role()
);
