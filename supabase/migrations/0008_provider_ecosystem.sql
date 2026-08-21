-- Migration: 0008_provider_ecosystem.sql
-- Description: Adds 5-capability provider ecosystem support, verification workflow, notifications, and expands offerings for tours and transport.

create extension if not exists pgcrypto;

-- 1. Ensure profiles table has verification columns and provider capabilities
alter table public.profiles
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_details jsonb not null default '{}'::jsonb,
  add column if not exists verification_submitted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_verification_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_verification_status_check
      check (verification_status in ('unverified', 'under_review', 'verified', 'rejected'));
  end if;
end $$;

-- 2. Update provider_offerings table to support all 5 capability kinds:
-- 'product', 'experience', 'stay', 'tour', 'transport'
do $$
begin
  alter table public.provider_offerings
    drop constraint if exists provider_offerings_kind_check;

  alter table public.provider_offerings
    add constraint provider_offerings_kind_check
    check (kind in ('product', 'experience', 'stay', 'tour', 'transport'));
exception
  when others then null;
end $$;

-- 3. Update provider_requests table to support all request types
do $$
begin
  alter table public.provider_requests
    drop constraint if exists provider_requests_request_type_check;

  alter table public.provider_requests
    add constraint provider_requests_request_type_check
    check (request_type in ('learning', 'booking', 'order', 'tour', 'transport', 'enquiry'));
exception
  when others then null;
end $$;

-- 4. Create provider notifications table
create table if not exists public.provider_notifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'request', 'review', 'verification', 'alert')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists provider_notifications_provider_id_idx on public.provider_notifications (provider_id);
create index if not exists provider_notifications_read_idx on public.provider_notifications (read);

alter table public.provider_notifications enable row level security;

drop policy if exists "Providers can view own notifications" on public.provider_notifications;
create policy "Providers can view own notifications"
on public.provider_notifications
for select
to authenticated
using (
  provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can update own notifications" on public.provider_notifications;
create policy "Providers can update own notifications"
on public.provider_notifications
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

-- 5. Update get_public_provider_profile RPC to include verification fields
drop function if exists public.get_public_provider_profile(uuid);

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
  verification_status text,
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
    coalesce(p.verification_status, 'unverified') as verification_status,
    p.created_at
  from public.profiles p
  where p.id = provider_user_id
    and p.role = 'provider';
$$;

grant execute on function public.get_public_provider_profile(uuid) to anon, authenticated, service_role;
