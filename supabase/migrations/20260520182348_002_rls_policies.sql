-- Enable RLS on all tables
alter table public.properties enable row level security;
alter table public.property_highlights enable row level security;
alter table public.property_rooms enable row level security;
alter table public.room_amenities enable row level security;
alter table public.property_photos enable row level security;
alter table public.property_house_rules enable row level security;
alter table public.admin_users enable row level security;
alter table public.bookings enable row level security;
alter table public.external_blocked_dates enable row level security;
alter table public.inquiries enable row level security;

-- Public read on content tables (only is_published properties + their related rows)
create policy properties_public_read on public.properties
  for select to anon, authenticated
  using (is_published = true);

create policy property_highlights_public_read on public.property_highlights
  for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.is_published));

create policy property_rooms_public_read on public.property_rooms
  for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.is_published));

create policy room_amenities_public_read on public.room_amenities
  for select to anon, authenticated
  using (exists (
    select 1 from public.property_rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id and p.is_published
  ));

create policy property_photos_public_read on public.property_photos
  for select to anon, authenticated
  using (exists (
    select 1 from public.property_rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id and p.is_published
  ));

create policy property_house_rules_public_read on public.property_house_rules
  for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.is_published));

-- External blocked dates: public read (needed for availability check)
create policy external_blocked_dates_public_read on public.external_blocked_dates
  for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.is_published));

-- Bookings: admin all
create policy bookings_admin_all on public.bookings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inquiries: anon can INSERT, admin can SELECT/UPDATE
create policy inquiries_anon_insert on public.inquiries
  for insert to anon, authenticated
  with check (true);

create policy inquiries_admin_select on public.inquiries
  for select to authenticated
  using (public.is_admin());

create policy inquiries_admin_update on public.inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin write on content tables
create policy properties_admin_write on public.properties
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_highlights_admin_write on public.property_highlights
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_rooms_admin_write on public.property_rooms
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy room_amenities_admin_write on public.room_amenities
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_photos_admin_write on public.property_photos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy property_house_rules_admin_write on public.property_house_rules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy external_blocked_dates_admin_write on public.external_blocked_dates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy admin_users_admin_read on public.admin_users
  for select to authenticated
  using (public.is_admin());

-- Public availability view
create or replace view public.property_occupied_dates with (security_invoker = on) as
  select
    property_id,
    arrival as start_date,
    departure as end_date,
    'booking' as source
  from public.bookings
  where status in ('pending', 'confirmed')
  union all
  select
    property_id,
    start_date,
    end_date,
    source
  from public.external_blocked_dates;

grant select on public.property_occupied_dates to anon, authenticated;
