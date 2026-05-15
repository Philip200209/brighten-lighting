-- Fix for RLS infinite recursion: create security-definer helper and update policies

-- Helper: returns true if current auth user is an admin (bypasses RLS via security definer)
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Update profiles admin policies to use helper

drop policy if exists profiles_select_admin_all on public.profiles;
create policy profiles_select_admin_all
  on public.profiles
  for select
  using (public.is_admin());

drop policy if exists profiles_update_admin_all on public.profiles;
create policy profiles_update_admin_all
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_insert_new_user on public.profiles;
create policy profiles_insert_new_user
  on public.profiles
  for insert
  to authenticated
  with check (true);

-- Update products policies to use helper

drop policy if exists products_insert_admin on public.products;
create policy products_insert_admin
  on public.products
  for insert
  with check (public.is_admin());

drop policy if exists products_update_admin on public.products;
create policy products_update_admin
  on public.products
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin
  on public.products
  for delete
  using (public.is_admin());

-- Update inquiries policies to use helper

drop policy if exists inquiries_insert_public on public.inquiries;
create policy inquiries_insert_public
  on public.inquiries
  for insert
  with check (true);

drop policy if exists inquiries_select_public on public.inquiries;
create policy inquiries_select_public
  on public.inquiries
  for select
  using (true);

drop policy if exists inquiries_select_admin on public.inquiries;
create policy inquiries_select_admin
  on public.inquiries
  for select
  using (public.is_admin());

drop policy if exists inquiries_update_admin on public.inquiries;
create policy inquiries_update_admin
  on public.inquiries
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists inquiries_delete_admin on public.inquiries;
create policy inquiries_delete_admin
  on public.inquiries
  for delete
  using (public.is_admin());

-- Update payments policies to use helper

drop policy if exists payments_select_admin on public.payments;
create policy payments_select_admin
  on public.payments
  for select
  using (public.is_admin());

drop policy if exists payments_insert_admin on public.payments;
create policy payments_insert_admin
  on public.payments
  for insert
  with check (public.is_admin());

drop policy if exists payments_update_admin on public.payments;
create policy payments_update_admin
  on public.payments
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists payments_delete_admin on public.payments;
create policy payments_delete_admin
  on public.payments
  for delete
  using (public.is_admin());

-- Cart storage for logged-in users
create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  customer_name text,
  phone varchar(20) not null,
  address text not null,
  payment_method varchar(20) not null,
  payment_status varchar(50) not null default 'pending',
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  status varchar(50) not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;
alter table public.orders enable row level security;

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop policy if exists carts_select_own on public.carts;
create policy carts_select_own
  on public.carts
  for select
  using (auth.uid() = user_id);

drop policy if exists carts_insert_own on public.carts;
create policy carts_insert_own
  on public.carts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists carts_update_own on public.carts;
create policy carts_update_own
  on public.carts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
  on public.orders
  for select
  using (auth.uid() = user_id);

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own
  on public.orders
  for insert
  with check (auth.uid() = user_id);

drop policy if exists orders_update_own on public.orders;
create policy orders_update_own
  on public.orders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- End of fix
