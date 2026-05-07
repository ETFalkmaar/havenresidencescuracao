-- is_admin() is referenced inside RLS policies (e.g. "OR public.is_admin()"),
-- so every role that hits those tables must be able to EXECUTE it. Without
-- this grant, anon and authenticated requests hit "permission denied for
-- function is_admin" and the entire RLS check fails — every public read
-- returns 401 instead of the intended row set.
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Also tighten search_path with empty default (defense in depth) and re-grant
-- explicitly to keep the function deterministic.
ALTER FUNCTION public.is_admin() SET search_path = '';
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
