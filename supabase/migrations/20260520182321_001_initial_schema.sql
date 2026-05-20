-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  short_description text not null,
  description text not null,
  hero_photo_src text not null,
  hero_photo_alt text not null,
  max_guests int not null,
  max_guests_note text,
  bedrooms int not null,
  beds int not null,
  bathrooms int not null,
  check_in text not null,
  check_out text not null,
  base_price_per_night_usd int not null,
  cleaning_fee_usd int not null,
  deposit_usd int not null,
  long_term_nights int not null default 28,
  long_term_discount_percent int not null default 10,
  min_nights int not null default 1,
  high_season_note text,
  cancellation_policy text not null,
  airbnb_ical_url text,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_highlights (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text not null,
  display_order int not null default 0
);

create table public.property_rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  slug text not null,
  label text not null,
  display_order int not null default 0,
  unique(property_id, slug)
);

create table public.room_amenities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.property_rooms(id) on delete cascade,
  label text not null,
  display_order int not null default 0
);

create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.property_rooms(id) on delete cascade,
  src text not null,
  alt text not null,
  display_order int not null default 0
);

create table public.property_house_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  rule text not null,
  display_order int not null default 0
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  arrival date not null,
  departure date not null,
  guests int not null,
  notes text,
  status booking_status not null default 'pending',
  total_price_usd int not null,
  hold_expires_at timestamptz,
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (departure > arrival)
);

create index bookings_property_dates_idx on public.bookings(property_id, arrival, departure);
create index bookings_status_idx on public.bookings(status);

create table public.external_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  source text not null default 'airbnb',
  external_uid text,
  imported_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index external_blocked_property_idx on public.external_blocked_dates(property_id, start_date, end_date);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Updated-at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- is_admin() helper
create or replace function public.is_admin() returns boolean
language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;
