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

-- End of fix
