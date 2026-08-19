create extension if not exists pgcrypto;

do $$
begin
  create type public.destination_category as enum (
    'waterfall',
    'heritage',
    'tribal_culture',
    'eco',
    'craft',
    'adventure',
    'religious',
    'wildlife'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.destination_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end $$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'role', ''),
    nullif(auth.jwt() ->> 'app_role', ''),
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'public_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'user_metadata' ->> 'role', '')
  );
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
as $$
  select public.current_app_role() = 'admin';
$$;

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  district text not null,
  category public.destination_category not null,
  latitude double precision,
  longitude double precision,
  cover_image text,
  gallery text[] not null default '{}'::text[],
  eco_zone boolean not null default false,
  best_time text,
  entry_fee numeric,
  status public.destination_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_name_not_empty check (length(trim(name)) > 0),
  constraint destinations_slug_not_empty check (length(trim(slug)) > 0),
  constraint destinations_district_not_empty check (length(trim(district)) > 0),
  constraint destinations_latitude_range check (latitude is null or (latitude between -90 and 90)),
  constraint destinations_longitude_range check (longitude is null or (longitude between -180 and 180)),
  constraint destinations_entry_fee_non_negative check (entry_fee is null or entry_fee >= 0)
);

create index if not exists destinations_slug_idx on public.destinations (slug);
create index if not exists destinations_category_idx on public.destinations (category);
create index if not exists destinations_district_idx on public.destinations (district);
create index if not exists destinations_status_idx on public.destinations (status);
create index if not exists destinations_eco_zone_idx on public.destinations (eco_zone);
create index if not exists destinations_created_at_idx on public.destinations (created_at desc);

drop trigger if exists set_destinations_updated_at on public.destinations;
create trigger set_destinations_updated_at
before update on public.destinations
for each row
execute function public.set_updated_at();

alter table public.destinations enable row level security;

drop policy if exists "Public can view published destinations" on public.destinations;
create policy "Public can view published destinations"
on public.destinations
for select
using (status = 'published');

drop policy if exists "Authenticated admins can insert destinations" on public.destinations;
create policy "Authenticated admins can insert destinations"
on public.destinations
for insert
to authenticated
with check (public.is_admin_role());

drop policy if exists "Authenticated admins can update destinations" on public.destinations;
create policy "Authenticated admins can update destinations"
on public.destinations
for update
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "Authenticated admins can delete destinations" on public.destinations;
create policy "Authenticated admins can delete destinations"
on public.destinations
for delete
to authenticated
using (public.is_admin_role());

