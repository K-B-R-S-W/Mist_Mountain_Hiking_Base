"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const updateRoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  maxGuests: z.coerce.number().int().min(1).max(20),
  basePrice: z.coerce.number().min(0),
  isVisible: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

/**
 * Reference pattern for every admin mutation:
 *   1. withAdminAction() — requireAdmin() + catches everything into
 *      a consistent ActionResult, never an uncaught throw
 *   2. zod validation    — never trust client-side validation alone
 *   3. repository write  — scoped by RLS as a second, DB-level backstop
 *   4. activity log       — who changed what, when
 *   5. revalidatePath     — public pages reflect the change with no redeploy
 *
 * Covers every editable room field (the admin rooms list and the full
 * per-room edit page both call this — no separate "summary" variant).
 * Slug is intentionally not editable here: it's immutable once created
 * (spec.md §6, protects SEO/shared links).
 */
export async function updateRoom(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateRoomSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid room data: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const { id, ...room } = parsed.data;

    const { error } = await supabase
      .from("rooms")
      .update({
        name: room.name,
        short_description: room.shortDescription || null,
        description: room.description || null,
        max_guests: room.maxGuests,
        base_price: room.basePrice,
        is_visible: room.isVisible,
        featured: room.featured,
      })
      .eq("id", id);

    if (error) throw new Error("Failed to update room: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "room",
      entity_id: id,
    });

    revalidatePath("/");
    revalidatePath("/rooms", "layout");
    revalidatePath("/admin/rooms");
    revalidatePath(`/admin/rooms/${id}`);

    return { id };
  });
}
