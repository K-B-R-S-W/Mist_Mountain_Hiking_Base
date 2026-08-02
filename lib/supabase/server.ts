import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Use inside Server Components and Server Actions only.
 * Never import this into a Client Component.
 */
export async function createClient() {
  const cookieStore = await cookies();
  type CookieToSet = { name: string; value: string; options?: CookieOptions };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore
            // because middleware refreshes the session on the next request.
          }
        },
      },
    }
  );
}
