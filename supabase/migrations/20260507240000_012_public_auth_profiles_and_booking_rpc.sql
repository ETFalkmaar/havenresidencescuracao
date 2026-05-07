-- ===== PROFILES (any authenticated user, admin or guest) =====
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles self read" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "profiles self upsert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles self update" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles admin all" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== BOOKINGS: link to logged-in user =====
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guest_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_guest_user_idx ON public.bookings(guest_user_id);

DROP POLICY IF EXISTS "bookings admin all" ON public.bookings;
DROP POLICY IF EXISTS "bookings own read" ON public.bookings;
DROP POLICY IF EXISTS "bookings admin write" ON public.bookings;

CREATE POLICY "bookings own read" ON public.bookings
  FOR SELECT USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND guest_user_id = auth.uid())
  );

CREATE POLICY "bookings admin write" ON public.bookings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===== Public availability function =====
CREATE OR REPLACE FUNCTION public.unit_blocked_ranges(p_unit_id uuid)
RETURNS TABLE (check_in date, check_out date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT check_in, check_out
  FROM public.bookings
  WHERE unit_id = p_unit_id
    AND status IN ('pending', 'confirmed', 'completed')
$$;

GRANT EXECUTE ON FUNCTION public.unit_blocked_ranges(uuid) TO anon, authenticated;

-- ===== create_booking RPC =====
CREATE OR REPLACE FUNCTION public.create_booking(
  p_unit_id uuid,
  p_check_in date,
  p_check_out date,
  p_num_guests int,
  p_stay_type text,
  p_guest_name text,
  p_guest_phone text,
  p_notes text,
  p_subtotal_eur numeric,
  p_cleaning_fee_eur numeric,
  p_total_eur numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_overlap int;
  v_reference text;
  v_year text := to_char(now(), 'YY');
  v_unit_slug text;
  v_property_slug text;
  v_inserted_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'login_required');
  END IF;

  IF p_check_out <= p_check_in THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_dates');
  END IF;

  IF p_num_guests < 1 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_guests');
  END IF;

  IF p_stay_type NOT IN ('short', 'long') THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_stay_type');
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'user_email_missing');
  END IF;

  SELECT u.slug, p.slug INTO v_unit_slug, v_property_slug
  FROM public.units u
  JOIN public.properties p ON p.id = u.property_id
  WHERE u.id = p_unit_id AND u.status = 'active' AND p.status IN ('active', 'coming_soon');
  IF v_unit_slug IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'unit_not_bookable');
  END IF;

  SELECT count(*) INTO v_overlap
  FROM public.bookings
  WHERE unit_id = p_unit_id
    AND status IN ('pending', 'confirmed', 'completed')
    AND p_check_in < check_out
    AND p_check_out > check_in;
  IF v_overlap > 0 THEN
    RETURN json_build_object('ok', false, 'error', 'dates_unavailable');
  END IF;

  v_reference := 'HR-' || v_year || '-' || lpad(
    (floor(random() * 99999))::int::text, 5, '0'
  );

  INSERT INTO public.bookings (
    reference, unit_id, stay_type, check_in, check_out, num_guests,
    guest_name, guest_email, guest_phone, notes,
    subtotal_eur, cleaning_fee_eur, total_eur,
    status, guest_user_id
  ) VALUES (
    v_reference, p_unit_id, p_stay_type::stay_type, p_check_in, p_check_out, p_num_guests,
    p_guest_name, v_user_email, p_guest_phone, p_notes,
    p_subtotal_eur, p_cleaning_fee_eur, p_total_eur,
    'pending', v_user_id
  ) RETURNING id INTO v_inserted_id;

  RETURN json_build_object(
    'ok', true,
    'reference', v_reference,
    'booking_id', v_inserted_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_booking(uuid, date, date, int, text, text, text, text, numeric, numeric, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_booking(uuid, date, date, int, text, text, text, text, numeric, numeric, numeric) TO authenticated;
