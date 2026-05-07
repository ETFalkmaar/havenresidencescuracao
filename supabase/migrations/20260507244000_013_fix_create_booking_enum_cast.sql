-- The previous create_booking RPC was defined with SET search_path = '' for
-- security, but didn't qualify the enum casts (stay_type / booking_status).
-- Postgres couldn't resolve them and the RPC returned 'type "stay_type" does
-- not exist'. This redefinition schema-qualifies the casts.
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
    v_reference, p_unit_id, p_stay_type::public.stay_type, p_check_in, p_check_out, p_num_guests,
    p_guest_name, v_user_email, p_guest_phone, p_notes,
    p_subtotal_eur, p_cleaning_fee_eur, p_total_eur,
    'pending'::public.booking_status, v_user_id
  ) RETURNING id INTO v_inserted_id;

  RETURN json_build_object(
    'ok', true,
    'reference', v_reference,
    'booking_id', v_inserted_id
  );
END;
$$;
