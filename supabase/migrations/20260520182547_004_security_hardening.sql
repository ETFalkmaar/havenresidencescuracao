-- Fix search_path on set_updated_at function
create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix search_path on is_admin function
create or replace function public.is_admin() returns boolean
language sql security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- Restrict is_admin to authenticated only
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Tighten inquiries insert with basic validation
drop policy if exists inquiries_anon_insert on public.inquiries;
create policy inquiries_anon_insert on public.inquiries
  for insert to anon, authenticated
  with check (
    length(trim(guest_name)) > 0
    and length(trim(guest_email)) > 2
    and guest_email like '%@%'
    and length(trim(message)) > 0
    and length(message) < 5000
  );
