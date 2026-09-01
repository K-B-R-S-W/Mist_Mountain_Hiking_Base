"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const schema = z.object({ id: z.string().uuid() });

export async function deleteTestimonial(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid testimonial id.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("testimonials")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", parsed.data.id);
    if (error) throw new Error("Failed to delete testimonial: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "testimonial",
      entity_id: parsed.data.id,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { id: parsed.data.id };
  });
}
