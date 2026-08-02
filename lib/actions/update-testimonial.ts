"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const updateTestimonialSchema = z.object({
  id: z.string().uuid(),
  isApproved: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
});

export async function updateTestimonial(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateTestimonialSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid testimonial update: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const { id, ...testimonial } = parsed.data;

    const { error } = await supabase
      .from("testimonials")
      .update({
        is_approved: testimonial.isApproved,
        is_featured: testimonial.isFeatured,
      })
      .eq("id", id);

    if (error) throw new Error("Failed to update testimonial: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "testimonial",
      entity_id: id,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { id };
  });
}

