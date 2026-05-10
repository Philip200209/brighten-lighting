#!/usr/bin/env node

import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

// Read .env
const raw = await fs.readFile('.env', 'utf8');
const env = Object.fromEntries(raw.split(/\r?\n/).filter(Boolean).map(line => line.split('=')));

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL = `
-- Create citext extension
create extension if not exists citext;

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  email citext not null unique,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index
create index if not exists profiles_role_idx on public.profiles (role);

-- Create updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all"
on public.profiles
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "profiles_update_admin_all" on public.profiles;
create policy "profiles_update_admin_all"
on public.profiles
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
`;

console.log('Creating profiles table and RLS policies...');

try {
  const { error } = await supabase.rpc('run_sql', { sql: SQL }).catch(() => ({ error: true }));
  
  // Since rpc might not exist, try direct SQL execution via exec method if available
  // Actually, let's use a different approach - query the table to create it if it doesn't exist
  const { error: checkError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (checkError?.code === 'PGRST116' || checkError?.message?.includes('not found')) {
    console.log('Profiles table does not exist. Creating via SQL editor requires manual setup.');
    console.log('\nRun this SQL in the Supabase SQL Editor:');
    console.log(SQL);
    process.exit(1);
  } else if (checkError) {
    console.log('Error checking profiles table:', checkError);
    console.log('\nYou may need to run this SQL in the Supabase SQL Editor:');
    console.log(SQL);
    process.exit(1);
  }

  console.log('✓ Profiles table already exists');
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nRun this SQL in the Supabase SQL Editor:');
  console.log(SQL);
  process.exit(1);
}
