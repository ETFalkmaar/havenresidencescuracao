-- Extend the existing unit_blocked_ranges RPC so it also surfaces
-- Airbnb-imported reservations stored in external_blocked_dates.
-- The booking form on /[slug] already consumes this RPC, so adding
-- external blocks here makes them automatically grey out in the
-- date picker without any client-side changes.
DROP FUNCTION IF EXISTS public.unit_blocked_ranges(uuid);

CREATE FUNCTION public.unit_blocked_ranges(p_unit_id uuid)
RETURNS TABLE(start_date date, end_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.check_in AS start_date, b.check_out AS end_date
  FROM public.bookings b
  WHERE b.unit_id = p_unit_id
    AND b.status IN ('pending','confirmed','completed')
  UNION ALL
  SELECT e.start_date, e.end_date
  FROM public.external_blocked_dates e
  WHERE e.unit_id = p_unit_id;
$$;

GRANT EXECUTE ON FUNCTION public.unit_blocked_ranges(uuid) TO anon, authenticated;
