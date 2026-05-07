-- 1. Pin search_path on trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Revoke direct execution of is_admin() from anon/authenticated.
--    NOTE: this turned out to be incorrect — RLS policies need anon and
--    authenticated to be able to invoke is_admin(). Migration 006 reverses
--    this revoke. Kept here for migration history fidelity.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO postgres, service_role;

-- 3. Tighten inquiries INSERT policy with content checks instead of WITH CHECK (true).
DROP POLICY IF EXISTS "inquiries public insert" ON public.inquiries;
CREATE POLICY "inquiries public insert" ON public.inquiries
  FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email LIKE '%@%'
    AND length(message) BETWEEN 1 AND 5000
    AND (phone IS NULL OR length(phone) <= 50)
    AND (preferred_dates IS NULL OR length(preferred_dates) <= 200)
  );
