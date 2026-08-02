"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const schema = z.object({ id: z.string().uuid() });

export async function deleteRoom(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid room id.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("rooms")
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), is_visible: false })
      .eq("id", parsed.data.id);
    if (error) throw new Error("Failed to delete room: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "room",
      entity_id: parsed.data.id,
    });

    revalidatePath("/rooms", "layout");
    revalidatePath("/admin/rooms");
    return { id: parsed.data.id };
  });
}
