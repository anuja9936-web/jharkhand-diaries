-- ==============================================================================
-- Jharkhand Diaries — Government Administrator Setup (Development / Demo)
-- ==============================================================================
--
-- SECURITY NOTE:
-- In accordance with security principles, government/admin accounts cannot be 
-- registered from the public web interface. 
--
-- To establish a local development or demo administrator:
-- 1. Create a user normally via the standard auth flow or Supabase dashboard / Clerk.
-- 2. Execute the query below in the Supabase SQL Editor to elevate the role to 'admin'.
-- ==============================================================================

-- Option A: Promote an existing user by their registered email address
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = now()
WHERE 
  email = 'admin@jharkhandtourism.gov.in';

-- Option B: Promote an existing user by their Supabase user UUID (id)
-- Replace the UUID below with the actual user UUID from auth.users or public.profiles
-- UPDATE public.profiles
-- SET 
--   role = 'admin',
--   updated_at = now()
-- WHERE 
--   id = '00000000-0000-0000-0000-000000000000';

-- ==============================================================================
-- Verification Query: Check all active administrators
-- ==============================================================================
SELECT 
  id,
  full_name,
  email,
  role,
  created_at,
  updated_at
FROM 
  public.profiles
WHERE 
  role = 'admin';
