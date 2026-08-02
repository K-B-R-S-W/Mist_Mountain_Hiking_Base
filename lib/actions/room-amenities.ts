"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const setSchema = z.object({
  roomId: z.string().uuid(),
  amenityIds: z.array(z.string().uuid()),
});

/** Replaces the room's full amenity set. Delete-then-insert, not a single
 * transaction (same caveat as reorder-room.ts) — acceptable here since a
 * partial failure just means re-saving the form again. */
export async function setRoomAmenities(input: unknown): Promise<ActionResult<{ roomId: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = setSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid amenities selection.");

    const supabase = await createClient();
    const { error: deleteError } = await supabase
      .from("room_amenities")
      .delete()
      .eq("room_id", parsed.data.roomId);
    if (deleteError) throw new Error("Failed to update amenities: " + deleteError.message);

    if (parsed.data.amenityIds.length > 0) {
      const { error: insertError } = await supabase.from("room_amenities").insert(
        parsed.data.amenityIds.map((amenityId) => ({
          room_id: parsed.data.roomId,
          amenity_id: amenityId,
        }))
      );
      if (insertError) throw new Error("Failed to update amenities: " + insertError.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "room_amenities",
      entity_id: parsed.data.roomId,
    });

    revalidatePath("/rooms", "layout");
    revalidatePath(`/admin/rooms/${parsed.data.roomId}`);
    return { roomId: parsed.data.roomId };
  });
}

const createAmenitySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

/** Amenities are a small, shared vocabulary (spec.md §6: `amenities` table,
 * referenced by every room) — kept as a lightweight inline "add" here rather
 * than a full CRUD page, since renaming/deleting isn't a real need yet. */
export async function createAmenity(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = createAmenitySchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid amenity name.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("amenities")
      .insert({ name: parsed.data.name })
      .select("id")
      .single();
    if (error || !data) {
      throw new Error("Failed to create amenity: " + (error?.message ?? "it may already exist"));
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "amenity",
      entity_id: data.id,
    });

    revalidatePath("/admin/rooms");
    return { id: data.id };
  });
}
