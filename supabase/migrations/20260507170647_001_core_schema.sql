-- ============ ENUMS ============
CREATE TYPE property_status AS ENUM ('active', 'coming_soon', 'draft', 'archived');
CREATE TYPE parking_type AS ENUM ('private', 'public', 'street', 'none');
CREATE TYPE utilities_system AS ENUM ('included', 'metered', 'prepaid_card');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE stay_type AS ENUM ('short', 'long');
CREATE TYPE inquiry_status AS ENUM ('new', 'replied', 'closed');
CREATE TYPE review_source AS ENUM ('google', 'trustpilot');

-- ============ HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ ADMIN USERS ============
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
$$;

-- ============ PROPERTIES ============
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  color_name text NOT NULL,
  color_hex text,
  tagline text,
  short_description text,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Curaçao',
  latitude numeric(9,6),
  longitude numeric(9,6),
  status property_status NOT NULL DEFAULT 'active',
  parking parking_type NOT NULL DEFAULT 'private',
  is_gated boolean NOT NULL DEFAULT false,
  pets_allowed boolean NOT NULL DEFAULT false,
  utilities utilities_system NOT NULL DEFAULT 'included',
  utilities_notes text,
  hero_image_url text,
  available_from date,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ UNITS ============
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  bedrooms int NOT NULL DEFAULT 1,
  bathrooms numeric(3,1) NOT NULL DEFAULT 1,
  max_guests int NOT NULL DEFAULT 2,
  size_m2 int,
  base_price_eur numeric(10,2) NOT NULL,
  cleaning_fee_eur numeric(10,2) NOT NULL DEFAULT 0,
  min_short_stay_nights int NOT NULL DEFAULT 1,
  min_long_stay_months int NOT NULL DEFAULT 4,
  long_stay_monthly_price_eur numeric(10,2),
  status text NOT NULL DEFAULT 'active',
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(property_id, slug)
);
CREATE INDEX units_property_id_idx ON public.units(property_id);
CREATE TRIGGER units_updated_at BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PHOTOS ============
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  position int NOT NULL DEFAULT 0,
  is_hero boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (property_id IS NOT NULL OR unit_id IS NOT NULL)
);
CREATE INDEX photos_property_id_idx ON public.photos(property_id);
CREATE INDEX photos_unit_id_idx ON public.photos(unit_id);

-- ============ AMENITIES ============
CREATE TABLE public.amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  category text
);

CREATE TABLE public.unit_amenities (
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (unit_id, amenity_id)
);

-- ============ PRICING SEASONS ============
CREATE TABLE public.pricing_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price_multiplier numeric(4,2),
  fixed_price_eur numeric(10,2),
  position int NOT NULL DEFAULT 0,
  CHECK (end_date >= start_date),
  CHECK (price_multiplier IS NOT NULL OR fixed_price_eur IS NOT NULL)
);
CREATE INDEX pricing_seasons_unit_idx ON public.pricing_seasons(unit_id);

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  unit_id uuid NOT NULL REFERENCES public.units(id),
  stay_type stay_type NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  num_guests int NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  notes text,
  subtotal_eur numeric(10,2) NOT NULL,
  cleaning_fee_eur numeric(10,2) NOT NULL DEFAULT 0,
  total_eur numeric(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out > check_in),
  CHECK (num_guests > 0),
  CHECK (total_eur >= 0)
);
CREATE INDEX bookings_unit_idx ON public.bookings(unit_id);
CREATE INDEX bookings_dates_idx ON public.bookings(check_in, check_out);
CREATE INDEX bookings_status_idx ON public.bookings(status);
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ INQUIRIES ============
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  preferred_dates text,
  status inquiry_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiries_created_at_idx ON public.inquiries(created_at DESC);

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id),
  booking_id uuid REFERENCES public.bookings(id),
  guest_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  language text DEFAULT 'en',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_unit_idx ON public.reviews(unit_id);

CREATE TABLE public.external_review_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  source review_source NOT NULL,
  url text NOT NULL,
  rating numeric(3,1),
  total_reviews int,
  badge_html text,
  last_synced_at timestamptz,
  UNIQUE(property_id, source)
);

-- ============ SITE SETTINGS (singleton) ============
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'Haven Residence',
  brand_tagline text,
  brand_description text,
  whatsapp_number text,
  emergency_phone text,
  contact_email text,
  instagram_url text,
  tiktok_url text,
  google_review_url text,
  trustpilot_url text,
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
