-- Migration: 0009_tourism_administration.sql
-- Description: Adds tables and RLS policies for Government Tourism Administration (Alerts & Advisories, Feedback & Complaints Moderation).

create extension if not exists pgcrypto;

-- 1. Tourism Alerts Table
create table if not exists public.tourism_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null check (type in ('weather', 'safety', 'road', 'closure', 'festival', 'emergency', 'general')),
  severity text not null check (severity in ('info', 'advisory', 'warning', 'critical')),
  district text,
  destination_id uuid references public.destinations (id) on delete set null,
  destination_name text,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tourism_alerts_district_idx on public.tourism_alerts (district);
create index if not exists tourism_alerts_destination_id_idx on public.tourism_alerts (destination_id);
create index if not exists tourism_alerts_status_idx on public.tourism_alerts (status);
create index if not exists tourism_alerts_severity_idx on public.tourism_alerts (severity);
create index if not exists tourism_alerts_created_at_idx on public.tourism_alerts (created_at desc);

drop trigger if exists set_tourism_alerts_updated_at on public.tourism_alerts;
create trigger set_tourism_alerts_updated_at
before update on public.tourism_alerts
for each row
execute function public.set_row_updated_at();

alter table public.tourism_alerts enable row level security;

drop policy if exists "Public can read published active alerts" on public.tourism_alerts;
create policy "Public can read published active alerts"
on public.tourism_alerts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admins can manage all tourism alerts" on public.tourism_alerts;
create policy "Admins can manage all tourism alerts"
on public.tourism_alerts
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

-- 2. Tourism Feedback & Complaints Table
create table if not exists public.tourism_feedback (
  id uuid primary key default gen_random_uuid(),
  reporter_name text not null,
  reporter_email text,
  reporter_phone text,
  category text not null check (category in ('tourist_feedback', 'provider_complaint', 'destination_issue', 'safety_concern', 'service_complaint', 'other')),
  subject text not null,
  message text not null,
  district text,
  destination_id uuid references public.destinations (id) on delete set null,
  destination_name text,
  provider_id uuid references auth.users (id) on delete set null,
  provider_name text,
  status text not null default 'new' check (status in ('new', 'under_review', 'resolved', 'closed')),
  admin_notes text,
  resolution_summary text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tourism_feedback_status_idx on public.tourism_feedback (status);
create index if not exists tourism_feedback_category_idx on public.tourism_feedback (category);
create index if not exists tourism_feedback_district_idx on public.tourism_feedback (district);
create index if not exists tourism_feedback_created_at_idx on public.tourism_feedback (created_at desc);

drop trigger if exists set_tourism_feedback_updated_at on public.tourism_feedback;
create trigger set_tourism_feedback_updated_at
before update on public.tourism_feedback
for each row
execute function public.set_row_updated_at();

alter table public.tourism_feedback enable row level security;

drop policy if exists "Anyone can submit tourism feedback" on public.tourism_feedback;
create policy "Anyone can submit tourism feedback"
on public.tourism_feedback
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can view and manage all tourism feedback" on public.tourism_feedback;
create policy "Admins can view and manage all tourism feedback"
on public.tourism_feedback
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());
