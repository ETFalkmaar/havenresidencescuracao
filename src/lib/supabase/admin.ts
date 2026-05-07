import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service role key — bypasses RLS.
 * Use ONLY for admin actions that need to read/write across all rows or
 * touch the auth schema (e.g. listing users by email). Never import from
 * Client Components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
