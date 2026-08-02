import "server-only";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import type { User } from "@supabase/supabase-js";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Wrap every admin Server Action body in this. Handles the
 * requireAdmin() call and turns any thrown error into a consistent
 * { ok: false, error } shape instead of an uncaught exception reaching
 * the client as a generic "Internal Server Error".
 *
 * Usage:
 *   export async function updateRoom(input: unknown) {
 *     return withAdminAction(async ({ user }) => {
 *       // ...validate, write, log, revalidate...
 *       return updatedRoom;
 *     });
 *   }
 */
export async function withAdminAction<T>(
  fn: (ctx: { user: User; role: "admin" | "staff" }) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const ctx = await requireAdmin();
    const data = await fn(ctx);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { ok: false, error: "Not authorized." };
    }
    console.error("Admin action failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}
