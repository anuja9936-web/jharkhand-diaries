create extension if not exists pgcrypto;

alter table public.destinations
  add column if not exists provider_id uuid references auth.users (id) on delete set null;

create index if not exists destinations_provider_id_idx on public.destinations (provider_id);

drop policy if exists "Providers can view own destinations" on public.destinations;
create policy "Providers can view own destinations"
on public.destinations
for select
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can insert destinations" on public.destinations;
create policy "Providers can insert destinations"
on public.destinations
for insert
to authenticated
with check (
  (
    provider_id = auth.uid()
    and public.get_current_profile_role() = 'provider'
  )
  or public.is_admin_role()
);

drop policy if exists "Providers can update own destinations" on public.destinations;
create policy "Providers can update own destinations"
on public.destinations
for update
to authenticated
using (
  (
    provider_id = auth.uid()
    and public.get_current_profile_role() = 'provider'
  )
  or public.is_admin_role()
)
with check (
  (
    provider_id = auth.uid()
    and public.get_current_profile_role() = 'provider'
  )
  or public.is_admin_role()
);

drop policy if exists "Providers can delete own destinations" on public.destinations;
create policy "Providers can delete own destinations"
on public.destinations
for delete
to authenticated
using (
  (
    provider_id = auth.uid()
    and public.get_current_profile_role() = 'provider'
  )
  or public.is_admin_role()
);
