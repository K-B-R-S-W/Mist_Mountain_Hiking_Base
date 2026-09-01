"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { softDeleteMediaFile } from "@/lib/media/delete";

const schema = z.object({ id: z.string().uuid() });

export async function deleteMedia(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid media id.");

    await softDeleteMediaFile(parsed.data.id);

    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "media",
      entity_id: parsed.data.id,
    });

    revalidatePath("/rooms", "layout");
    revalidatePath("/gallery");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/media");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/gallery");
    return { id: parsed.data.id };
  });
}
