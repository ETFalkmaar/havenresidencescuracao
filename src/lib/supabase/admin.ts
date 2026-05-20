import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Service-role Supabase client — bypassed RLS. NOOIT in client-bundle gebruiken.
 * Reserveer voor server-only cron-jobs en webhooks.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
