create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  email citext not null unique,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'staff'))
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name varchar(255) not null,
  category varchar(100) not null,
  price numeric(10, 2) not null check (price >= 0),
  description text not null,
  image_url text not null,
  stock integer not null default 10 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  name varchar(255) not null,
  email varchar(255) not null,
  phone varchar(20),
  message text not null,
  subject varchar(255),
  product_id bigint references public.products(id) on delete set null,
  status varchar(50) not null default 'new' check (status in ('new', 'resolved', 'spam', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id bigint generated always as identity primary key,
  phone_number varchar(20) not null,
  amount numeric(10, 2) not null check (amount >= 0),
  product_id bigint references public.products(id) on delete set null,
  inquiry_id bigint references public.inquiries(id) on delete set null,
  status varchar(50) not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  transaction_ref varchar(255),
  mpesa_receipt_number varchar(255),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  email citext not null,
  customer_name text,
  phone varchar(20) not null,
  address text not null,
  payment_method varchar(20) not null check (payment_method in ('mpesa', 'cod')),
  payment_status varchar(50) not null default 'pending' check (payment_status in ('pending', 'paid', 'cash_on_delivery', 'failed')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  items jsonb not null default '[]'::jsonb,
  status varchar(50) not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_name_idx on public.products (name);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_email_idx on public.inquiries (email);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_phone_idx on public.payments (phone_number);
create index if not exists payments_created_at_idx on public.payments (created_at desc);
create index if not exists carts_updated_at_idx on public.carts (updated_at desc);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.payments enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_insert_new_user on public.profiles;
create policy profiles_insert_new_user
on public.profiles
for insert
to authenticated
with check (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_select_admin_all on public.profiles;
create policy profiles_select_admin_all
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

drop policy if exists profiles_update_admin_all on public.profiles;
create policy profiles_update_admin_all
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

drop policy if exists products_select_public on public.products;
create policy products_select_public
on public.products
for select
using (true);

drop policy if exists products_insert_admin on public.products;
create policy products_insert_admin
on public.products
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists products_update_admin on public.products;
create policy products_update_admin
on public.products
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

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin
on public.products
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists inquiries_insert_public on public.inquiries;
create policy inquiries_insert_public
on public.inquiries
for insert
to anon, authenticated
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
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists inquiries_update_admin on public.inquiries;
create policy inquiries_update_admin
on public.inquiries
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

drop policy if exists inquiries_delete_admin on public.inquiries;
create policy inquiries_delete_admin
on public.inquiries
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists payments_select_admin on public.payments;
create policy payments_select_admin
on public.payments
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists payments_insert_admin on public.payments;
create policy payments_insert_admin
on public.payments
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists payments_update_admin on public.payments;
create policy payments_update_admin
on public.payments
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

drop policy if exists payments_delete_admin on public.payments;
create policy payments_delete_admin
on public.payments
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

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
