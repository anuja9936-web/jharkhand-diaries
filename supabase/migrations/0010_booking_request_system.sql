-- Migration: 0010_booking_request_system.sql
-- Description: Complete real booking and request foundation across all 5 provider categories with notifications and RLS.

create extension if not exists pgcrypto;

-- 1. Enhance provider_requests table
alter table public.provider_requests
  add column if not exists offering_kind text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists number_of_people integer default 1,
  add column if not exists estimated_amount numeric,
  add column if not exists provider_response text,
  add column if not exists details jsonb not null default '{}'::jsonb;

-- Ensure constraint for status
do $$
begin
  alter table public.provider_requests
    drop constraint if exists provider_requests_status_check;

  alter table public.provider_requests
    add constraint provider_requests_status_check
    check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled'));
exception
  when others then null;
end $$;

-- Ensure constraint for request_type
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

-- 2. Create tourist notifications table
create table if not exists public.tourist_notifications (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'booking_status', 'alert', 'review')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists tourist_notifications_tourist_id_idx on public.tourist_notifications (tourist_id);
create index if not exists tourist_notifications_read_idx on public.tourist_notifications (read);

alter table public.tourist_notifications enable row level security;

drop policy if exists "Tourists can view own notifications" on public.tourist_notifications;
create policy "Tourists can view own notifications"
on public.tourist_notifications
for select
to authenticated
using (
  tourist_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Tourists can update own notifications" on public.tourist_notifications;
create policy "Tourists can update own notifications"
on public.tourist_notifications
for update
to authenticated
using (
  tourist_id = auth.uid()
  or public.is_admin_role()
)
with check (
  tourist_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Authenticated users can insert tourist notifications" on public.tourist_notifications;
create policy "Authenticated users can insert tourist notifications"
on public.tourist_notifications
for insert
to authenticated
with check (true);

-- 3. Automatic Triggers for Provider & Tourist Notifications

-- When a tourist creates a request, notify the provider
create or replace function public.notify_provider_on_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.provider_notifications (
    provider_id,
    title,
    message,
    type,
    link,
    created_at
  ) values (
    new.provider_id,
    'New ' || initcap(coalesce(new.offering_kind, new.request_type)) || ' Request',
    'You received a new booking enquiry from ' || new.tourist_name || '.',
    'request',
    '/provider/requests',
    now()
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_provider_on_new_request on public.provider_requests;
create trigger trg_notify_provider_on_new_request
after insert on public.provider_requests
for each row
execute function public.notify_provider_on_new_request();

-- When a provider updates a request status or response, notify the tourist
create or replace function public.notify_tourist_on_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.status is distinct from new.status or old.provider_response is distinct from new.provider_response) then
    if new.tourist_id is not null then
      insert into public.tourist_notifications (
        tourist_id,
        title,
        message,
        type,
        link,
        created_at
      ) values (
        new.tourist_id,
        'Booking Update: ' || upper(new.status),
        case 
          when new.status = 'accepted' then 'Your booking request has been ACCEPTED by the provider.'
          when new.status = 'rejected' then 'Your booking request was declined.' || coalesce(' Note: ' || new.provider_response, '')
          when new.status = 'completed' then 'Your service has been marked as COMPLETED.'
          else 'Your booking status has changed to ' || new.status || '.'
        end,
        'booking_status',
        '/tourist/requests',
        now()
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_tourist_on_request_update on public.provider_requests;
create trigger trg_notify_tourist_on_request_update
after update on public.provider_requests
for each row
execute function public.notify_tourist_on_request_update();
