import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Use ONLY in contexts with
 * no Supabase user session to check against, where auth is instead a
 * separate shared secret (e.g. the cron route's CRON_SECRET header).
 *
 * Never import this into anything reachable from a request that carries
 * user input without its own independent authorization check first —
 * there is no RLS backstop here, unlike lib/supabase/server.ts.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set to use the service-role client."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
