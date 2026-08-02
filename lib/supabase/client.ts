import { createBrowserClient } from "@supabase/ssr";

/**
 * Use only inside Client Components that genuinely need live interactivity
 * (e.g. the media picker). Every other read/write goes through
 * lib/supabase/server.ts from a Server Component or Server Action.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
