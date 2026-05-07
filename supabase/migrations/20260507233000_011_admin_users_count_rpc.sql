-- Anon-callable count of admins (no PII), so the login page can decide
-- whether to show bootstrap mode without needing privileged access to
-- admin_users itself.
CREATE OR REPLACE FUNCTION public.admin_users_count()
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT count(*)::int FROM public.admin_users
$$;

GRANT EXECUTE ON FUNCTION public.admin_users_count() TO anon, authenticated;
