"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { uploadMediaFile } from "@/lib/media/upload";

export async function addRoomImage(formData: FormData): Promise<ActionResult<{ mediaId: string }>> {
  return withAdminAction(async ({ user }) => {
    const roomId = formData.get("roomId");
    const file = formData.get("file");
    const alt = formData.get("alt");
    if (typeof roomId !== "string") throw new Error("Missing room id.");
    if (!(file instanceof File) || file.size === 0) throw new Error("No image selected.");

    const media = await uploadMediaFile({
      file,
      bucket: "rooms",
      alt: typeof alt === "string" ? alt : null,
      uploadedBy: user.id,
    });

    const supabase = await createClient();
    const { count } = await supabase
      .from("room_images")
      .select("media_id", { count: "exact", head: true })
      .eq("room_id", roomId);

    const { error } = await supabase
      .from("room_images")
      .insert({ room_id: roomId, media_id: media.id, sort_order: count ?? 0 });
    if (error) throw new Error("Failed to attach image: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "room_image",
      entity_id: media.id,
    });

    revalidatePath("/rooms", "layout");
    revalidatePath(`/admin/rooms/${roomId}`);
    return { mediaId: media.id };
  });
}

const removeSchema = z.object({ roomId: z.string().uuid(), mediaId: z.string().uuid() });

export async function removeRoomImage(input: unknown): Promise<ActionResult<{ mediaId: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = removeSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid image reference.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("room_images")
      .delete()
      .eq("room_id", parsed.data.roomId)
      .eq("media_id", parsed.data.mediaId);
    if (error) throw new Error("Failed to remove image: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "room_image",
      entity_id: parsed.data.mediaId,
    });

    revalidatePath("/rooms", "layout");
    revalidatePath(`/admin/rooms/${parsed.data.roomId}`);
    return { mediaId: parsed.data.mediaId };
  });
}

const reorderSchema = z.object({
  roomId: z.string().uuid(),
  mediaId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

export async function reorderRoomImage(input: unknown): Promise<ActionResult<{ mediaId: string }>> {
  return withAdminAction(async () => {
    const parsed = reorderSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid reorder request.");

    const supabase = await createClient();
    const { data: images, error } = await supabase
      .from("room_images")
      .select("media_id, sort_order")
      .eq("room_id", parsed.data.roomId)
      .order("sort_order", { ascending: true });
    if (error || !images) throw new Error("Failed to load room images.");

    const index = images.findIndex((i) => i.media_id === parsed.data.mediaId);
    const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= images.length) {
      return { mediaId: parsed.data.mediaId }; // already at an edge — no-op
    }

    const current = images[index];
    const swapWith = images[swapIndex];
    if (!current || !swapWith) throw new Error("Failed to reorder images.");

    const [a, b] = await Promise.all([
      supabase
        .from("room_images")
        .update({ sort_order: swapWith.sort_order })
        .eq("room_id", parsed.data.roomId)
        .eq("media_id", current.media_id),
      supabase
        .from("room_images")
        .update({ sort_order: current.sort_order })
        .eq("room_id", parsed.data.roomId)
        .eq("media_id", swapWith.media_id),
    ]);
    if (a.error || b.error) throw new Error("Failed to reorder images.");

    revalidatePath("/rooms", "layout");
    revalidatePath(`/admin/rooms/${parsed.data.roomId}`);
    return { mediaId: parsed.data.mediaId };
  });
}
