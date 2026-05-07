-- Allows the very first authenticated user to claim admin role.
-- After one admin exists, this RPC returns an error.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_id uuid := auth.uid();
  caller_email text;
  admin_count int;
BEGIN
  IF caller_id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT count(*) INTO admin_count FROM public.admin_users;
  IF admin_count > 0 THEN
    RETURN json_build_object('ok', false, 'error', 'admin_exists');
  END IF;

  SELECT email INTO caller_email FROM auth.users WHERE id = caller_id;

  INSERT INTO public.admin_users (user_id, email, role)
  VALUES (caller_id, caller_email, 'owner')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN json_build_object('ok', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
