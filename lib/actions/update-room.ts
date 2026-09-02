"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const toOptionalString = (max: number) =>
  z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const str = String(val).trim();
    return str === "" ? null : str;
  }, z.string().max(max).nullable().optional());

const updateRoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Room name is required").max(200),
  shortDescription: toOptionalString(300),
  description: toOptionalString(5000),
  maxGuests: z.coerce.number().int().min(1).max(20),
  basePrice: z.coerce.number().min(0),
  isVisible: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

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
        short_description: room.shortDescription ?? null,
        description: room.description ?? null,
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
