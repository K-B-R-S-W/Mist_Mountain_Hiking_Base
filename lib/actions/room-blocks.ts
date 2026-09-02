"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const createBlockSchema = z.object({
  roomId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(1, "Reason is required").max(200),
});

export async function createRoomBlock(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = createBlockSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid block: " + parsed.error.issues[0]?.message);
    }

    if (parsed.data.endDate < parsed.data.startDate) {
      throw new Error("End date must be on or after start date.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_blocks")
      .insert({
        room_id: parsed.data.roomId,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        reason: parsed.data.reason,
        source: "manual",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error("Failed to create room block: " + error?.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "room_block",
      entity_id: data.id,
    });

    revalidatePath("/admin/availability");
    revalidatePath("/admin/rooms");
    return { id: data.id };
  });
}

const deleteBlockSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteRoomBlock(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = deleteBlockSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid block ID.");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("room_blocks")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      throw new Error("Failed to delete room block: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "room_block",
      entity_id: parsed.data.id,
    });

    revalidatePath("/admin/availability");
    revalidatePath("/admin/rooms");
    return { id: parsed.data.id };
  });
}
