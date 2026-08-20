-- Migration: 0011_fix_booking_and_provider_sync.sql
-- Description: Unifies provider request and booking lifecycle, fixes RLS, and aligns foreign keys

create extension if not exists pgcrypto;

-- 1. Ensure provider_offerings supports all 5 kinds
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

-- 2. Relax provider_requests constraints to prevent insert failures
do $$
begin
  alter table public.provider_requests
    drop constraint if exists provider_requests_offering_id_fkey;

  alter table public.provider_requests
    add constraint provider_requests_offering_id_fkey
    foreign key (offering_id) references public.provider_offerings (id)
    on delete set null;
exception
  when others then null;
end $$;

-- 3. Update RLS policies on provider_requests to allow reliable creation and management
alter table public.provider_requests enable row level security;

drop policy if exists "Tourists can create provider requests" on public.provider_requests;
create policy "Tourists can create provider requests"
on public.provider_requests
for insert
to authenticated
with check (
  tourist_id = auth.uid()
);

drop policy if exists "Providers can read own requests" on public.provider_requests;
drop policy if exists "Tourists can read their own requests" on public.provider_requests;
create policy "Users can read their own provider requests"
on public.provider_requests
for select
to authenticated
using (
  tourist_id = auth.uid()
  or provider_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "Providers can manage own requests" on public.provider_requests;
create policy "Providers and tourists can update requests"
on public.provider_requests
for update
to authenticated
using (
  provider_id = auth.uid()
  or tourist_id = auth.uid()
  or public.is_admin_role()
)
with check (
  provider_id = auth.uid()
  or tourist_id = auth.uid()
  or public.is_admin_role()
);

-- 4. Notification Triggers with safe existence check
create or replace function public.notify_provider_on_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only insert notification if target provider exists in auth.users
  if exists (select 1 from auth.users where id = new.provider_id) then
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
  end if;
  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists trg_notify_provider_on_new_request on public.provider_requests;
create trigger trg_notify_provider_on_new_request
after insert on public.provider_requests
for each row
execute function public.notify_provider_on_new_request();

create or replace function public.notify_tourist_on_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.status is distinct from new.status or old.provider_response is distinct from new.provider_response) then
    if new.tourist_id is not null and exists (select 1 from auth.users where id = new.tourist_id) then
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
exception
  when others then
    return new;
end;
$$;

drop trigger if exists trg_notify_tourist_on_request_update on public.provider_requests;
create trigger trg_notify_tourist_on_request_update
after update on public.provider_requests
for each row
execute function public.notify_tourist_on_request_update();
