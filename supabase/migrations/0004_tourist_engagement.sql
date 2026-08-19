create extension if not exists pgcrypto;

create table if not exists public.favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favourites_user_destination_unique unique (user_id, destination_id)
);

create index if not exists favourites_user_id_idx on public.favourites (user_id);
create index if not exists favourites_destination_id_idx on public.favourites (destination_id);

alter table public.favourites enable row level security;

drop policy if exists "Users can read own favourites" on public.favourites;
create policy "Users can read own favourites"
on public.favourites
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own favourites" on public.favourites;
create policy "Users can insert own favourites"
on public.favourites
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favourites" on public.favourites;
create policy "Users can delete own favourites"
on public.favourites
for delete
using (auth.uid() = user_id);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  budget numeric,
  start_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_title_not_empty check (length(trim(title)) > 0),
  constraint trips_budget_non_negative check (budget is null or budget >= 0)
);

create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_created_at_idx on public.trips (created_at desc);

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
before update on public.trips
for each row
execute function public.set_updated_at();

alter table public.trips enable row level security;

drop policy if exists "Users can read own trips" on public.trips;
create policy "Users can read own trips"
on public.trips
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own trips" on public.trips;
create policy "Users can insert own trips"
on public.trips
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own trips" on public.trips;
create policy "Users can update own trips"
on public.trips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own trips" on public.trips;
create policy "Users can delete own trips"
on public.trips
for delete
using (auth.uid() = user_id);

create or replace function public.is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips
    where id = p_trip_id
      and user_id = auth.uid()
  );
$$;

grant execute on function public.is_trip_owner(uuid) to authenticated, anon, service_role;

create table if not exists public.trip_destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  visit_date date,
  day_number integer not null default 1,
  visit_order integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  constraint trip_destinations_day_number_positive check (day_number > 0),
  constraint trip_destinations_visit_order_positive check (visit_order > 0),
  constraint trip_destinations_unique_trip_destination unique (trip_id, destination_id)
);

create index if not exists trip_destinations_trip_id_idx on public.trip_destinations (trip_id);
create index if not exists trip_destinations_destination_id_idx on public.trip_destinations (destination_id);
create index if not exists trip_destinations_trip_day_order_idx on public.trip_destinations (trip_id, day_number, visit_order);

alter table public.trip_destinations enable row level security;

drop policy if exists "Users can read own trip destinations" on public.trip_destinations;
create policy "Users can read own trip destinations"
on public.trip_destinations
for select
using (public.is_trip_owner(trip_id));

drop policy if exists "Users can insert own trip destinations" on public.trip_destinations;
create policy "Users can insert own trip destinations"
on public.trip_destinations
for insert
with check (public.is_trip_owner(trip_id));

drop policy if exists "Users can update own trip destinations" on public.trip_destinations;
create policy "Users can update own trip destinations"
on public.trip_destinations
for update
using (public.is_trip_owner(trip_id))
with check (public.is_trip_owner(trip_id));

drop policy if exists "Users can delete own trip destinations" on public.trip_destinations;
create policy "Users can delete own trip destinations"
on public.trip_destinations
for delete
using (public.is_trip_owner(trip_id));

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  rating integer not null,
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_unique_user_destination unique (user_id, destination_id)
);

create index if not exists reviews_user_id_idx on public.reviews (user_id);
create index if not exists reviews_destination_id_idx on public.reviews (destination_id);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews
for select
using (true);

drop policy if exists "Users can insert own reviews" on public.reviews;
create policy "Users can insert own reviews"
on public.reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
on public.reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
on public.reviews
for delete
using (auth.uid() = user_id);

