"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const schema = z.object({ id: z.string().uuid() });

export async function deleteGalleryImage(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid gallery image id.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("gallery_images")
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), is_visible: false })
      .eq("id", parsed.data.id);
    if (error) throw new Error("Failed to delete gallery image: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "gallery_image",
      entity_id: parsed.data.id,
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { id: parsed.data.id };
  });
}
