import "server-only";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Call this as the FIRST line of every admin Server Action.
 * Does not trust middleware having run. Independently verifies:
 *   1. a real Supabase session exists
 *   2. that user is present in admin_users
 *
 * Throws UnauthorizedError on failure — actions should catch this and
 * return a generic error to the client, never a raw stack trace.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    throw new UnauthorizedError("No active session");
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    throw new UnauthorizedError("Not an admin");
  }

  return { user, role: adminRow.role as "admin" | "staff" };
}
