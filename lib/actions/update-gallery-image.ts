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

const updateGalleryImageSchema = z.object({
  id: z.string().uuid(),
  title: toOptionalString(140),
  description: toOptionalString(2000),
  category: toOptionalString(50),
  isVisible: z.coerce.boolean(),
  featured: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export async function updateGalleryImage(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateGalleryImageSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid gallery update: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const { id, ...gallery } = parsed.data;

    const { error } = await supabase
      .from("gallery_images")
      .update({
        title: gallery.title ?? null,
        description: gallery.description ?? null,
        category: gallery.category ?? null,
        is_visible: gallery.isVisible,
        featured: gallery.featured,
        sort_order: gallery.sortOrder,
      })
      .eq("id", id);

    if (error) throw new Error("Failed to update gallery image: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "gallery_image",
      entity_id: id,
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { id };
  });
}
