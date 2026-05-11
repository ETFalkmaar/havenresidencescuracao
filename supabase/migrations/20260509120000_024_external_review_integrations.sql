-- Trustpilot + Google Reviews integration
--
-- We let the owner paste their Trustpilot business unit slug (e.g.
-- "havenresidencescuracao.com") and a Google Place ID into /admin/settings.
-- A nightly (or on-save) sync hits the public APIs server-side and stores
-- the rating, total review count and a small JSON array of recent reviews
-- in `external_review_aggregates`. The public /reviews page reads from
-- there — never directly from the third-party API.

-- ---------- site_settings: integration config ----------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS trustpilot_business_unit text,
  ADD COLUMN IF NOT EXISTS google_place_id text,
  -- Optional server-only API keys. May also be supplied via env vars.
  ADD COLUMN IF NOT EXISTS trustpilot_api_key text,
  ADD COLUMN IF NOT EXISTS google_api_key text;

-- Lock down API keys: only service_role (and through it, our server
-- actions) can read these — never the anon/browser client.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings'
      AND policyname = 'site_settings_public_read'
  ) THEN
    -- Replace the existing "public read" policy with one that excludes
    -- the api-key columns. We do this by switching to a view-based
    -- approach: keep the original policy but explicitly revoke
    -- column-level SELECT on the key columns from anon + authenticated.
    NULL;
  END IF;
END$$;

REVOKE SELECT (trustpilot_api_key, google_api_key)
  ON public.site_settings FROM anon, authenticated;

-- ---------- external_review_aggregates: add recent reviews JSON ----------
ALTER TABLE public.external_review_aggregates
  ADD COLUMN IF NOT EXISTS recent_reviews jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_sync_error text;

-- Ensure we can have at most one aggregate row per source for the
-- site-wide profile (property_id is null in that case).
CREATE UNIQUE INDEX IF NOT EXISTS external_review_aggregates_site_unique
  ON public.external_review_aggregates(source)
  WHERE property_id IS NULL;

-- ---------- RLS: public can read aggregates (already true), only admins can write ----------
ALTER TABLE public.external_review_aggregates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read external review aggregates" ON public.external_review_aggregates;
CREATE POLICY "public read external review aggregates"
  ON public.external_review_aggregates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admins write external review aggregates" ON public.external_review_aggregates;
CREATE POLICY "admins write external review aggregates"
  ON public.external_review_aggregates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
