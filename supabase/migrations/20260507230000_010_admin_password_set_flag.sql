-- Track whether an admin has set their own password (versus still using
-- the temp password the inviting owner gave them). When false, the admin
-- panel forces a password-change flow before allowing access.
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false;

-- Existing admins (right now: just the owner) have already chosen their own
-- password during signup, so backfill them as already-set.
UPDATE public.admin_users SET password_set = true WHERE password_set = false;
