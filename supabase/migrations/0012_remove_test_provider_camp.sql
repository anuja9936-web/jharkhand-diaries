-- ==============================================================================
-- Migration: 0012_remove_test_provider_camp.sql
-- Description: Safely remove the test provider and destination records for 
--              "Anuja Provider Test Camp Again" from the database.
-- ==============================================================================

-- 1. Remove any reviews referencing the test destination
delete from public.reviews
where destination_id in (
  select id from public.destinations
  where name = 'Anuja Provider Test Camp Again'
     or slug = 'anuja-provider-test-camp-again'
     or id = 'd5c12b43-9dff-4595-a8a3-b4ce08070431'
);

-- 2. Remove any provider_requests referencing the test offering or provider
delete from public.provider_requests
where offering_id in (
  select id from public.provider_offerings
  where name = 'Anuja Provider Test Camp Again'
     or slug = 'anuja-provider-test-camp-again'
) or provider_id in (
  select id from public.profiles
  where business_name = 'Anuja Provider Test Camp Again'
     or full_name = 'Anuja Provider Test Camp Again'
);

-- 3. Remove any provider_offerings matching the test name or slug
delete from public.provider_offerings
where name = 'Anuja Provider Test Camp Again'
   or slug = 'anuja-provider-test-camp-again';

-- 4. Remove the test destination record from public.destinations
delete from public.destinations
where name = 'Anuja Provider Test Camp Again'
   or slug = 'anuja-provider-test-camp-again'
   or id = 'd5c12b43-9dff-4595-a8a3-b4ce08070431';

-- 5. Remove test profile if specifically named "Anuja Provider Test Camp Again"
delete from public.profiles
where business_name = 'Anuja Provider Test Camp Again'
   or full_name = 'Anuja Provider Test Camp Again';
