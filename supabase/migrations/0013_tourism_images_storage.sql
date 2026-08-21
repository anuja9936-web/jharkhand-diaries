-- ==============================================================================
-- Migration: 0013_tourism_images_storage.sql
-- Description: Creates the public "tourism-images" Supabase Storage bucket
--              with organized subfolders and granular RLS security policies.
-- ==============================================================================

-- 1. Ensure the "tourism-images" public bucket exists in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tourism-images',
  'tourism-images',
  true,
  10485760, -- 10 MB per file limit
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]::text[];

-- 2. Policy: Public Read Access for anyone (tourists, anonymous visitors, authenticated)
drop policy if exists "Public Access for Tourism Images" on storage.objects;
create policy "Public Access for Tourism Images"
on storage.objects
for select
using (bucket_id = 'tourism-images');

-- 3. Policy: Authenticated Admins and Providers can upload real images
drop policy if exists "Authenticated Upload to Tourism Images" on storage.objects;
create policy "Authenticated Upload to Tourism Images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tourism-images'
  and (
    public.is_admin_role()
    or public.get_current_profile_role() in ('provider', 'admin')
  )
);

-- 4. Policy: Authenticated Admins and Providers can update existing images
drop policy if exists "Authenticated Update on Tourism Images" on storage.objects;
create policy "Authenticated Update on Tourism Images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tourism-images'
  and (
    public.is_admin_role()
    or public.get_current_profile_role() in ('provider', 'admin')
  )
)
with check (
  bucket_id = 'tourism-images'
  and (
    public.is_admin_role()
    or public.get_current_profile_role() in ('provider', 'admin')
  )
);

-- 5. Policy: Authenticated Admins and Providers can delete images
drop policy if exists "Authenticated Delete from Tourism Images" on storage.objects;
create policy "Authenticated Delete from Tourism Images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tourism-images'
  and (
    public.is_admin_role()
    or public.get_current_profile_role() in ('provider', 'admin')
  )
);
