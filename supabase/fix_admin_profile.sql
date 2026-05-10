-- Fix admin profile for Brighten Lighting
-- Run this in Supabase SQL Editor to create/fix the admin user profile

-- Step 1: Create profile for admin user if it doesn't exist
-- This finds the auth user with the admin email and creates a profile
insert into public.profiles (id, username, email, role)
select 
  id,
  'admin',
  email,
  'admin'
from auth.users
where email = 'info@brighteninglighting.com'
  and not exists (
    select 1 from public.profiles p where p.id = auth.users.id
  );

-- Step 2: Ensure profile has admin role
update public.profiles
set role = 'admin'
where email = 'info@brighteninglighting.com'
  and role != 'admin';

-- Verify
select id, username, email, role, created_at from public.profiles
where email = 'info@brighteninglighting.com';
