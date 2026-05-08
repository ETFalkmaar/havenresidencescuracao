-- Airbnb iCal integration:
--   units.airbnb_ical_url   → owner-supplied iCal feed for this unit
--   external_blocked_dates  → imported VEVENTs, keyed by source uid

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS airbnb_ical_url text;

CREATE TABLE IF NOT EXISTS public.external_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'airbnb',
  external_uid text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  summary text,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT external_blocked_dates_source_check
    CHECK (source IN ('airbnb','manual')),
  CONSTRAINT external_blocked_dates_uid_unique
    UNIQUE (unit_id, source, external_uid),
  CONSTRAINT external_blocked_dates_dates_check
    CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_ebd_unit_dates
  ON public.external_blocked_dates (unit_id, start_date, end_date);

ALTER TABLE public.external_blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ebd_read_all" ON public.external_blocked_dates;
CREATE POLICY "ebd_read_all"
  ON public.external_blocked_dates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ebd_admin_write" ON public.external_blocked_dates;
CREATE POLICY "ebd_admin_write"
  ON public.external_blocked_dates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.unit_blocked_dates(p_unit_id uuid)
RETURNS TABLE(start_date date, end_date date, source text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT b.check_in AS start_date, b.check_out AS end_date, 'booking'::text AS source
  FROM public.bookings b
  WHERE b.unit_id = p_unit_id
    AND b.status IN ('pending','confirmed','completed')
  UNION ALL
  SELECT e.start_date, e.end_date, e.source::text
  FROM public.external_blocked_dates e
  WHERE e.unit_id = p_unit_id;
$$;

GRANT EXECUTE ON FUNCTION public.unit_blocked_dates(uuid) TO anon, authenticated;
