import { createClient } from '@supabase/supabase-js';

/**
 * Service role client for server-side operations that bypass RLS.
 * USE WITH CAUTION - only use when you need to bypass RLS for trusted operations.
 * This should only be used on the server side, never expose to the client.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase service role configuration');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
