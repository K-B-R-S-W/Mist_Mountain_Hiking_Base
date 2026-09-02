"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { uploadMediaFile } from "@/lib/media/upload";

const toOptionalString = (max: number) =>
  z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const str = String(val).trim();
    return str === "" ? null : str;
  }, z.string().max(max).nullable().optional());

const createGallerySchema = z.object({
  title: toOptionalString(140),
  description: toOptionalString(2000),
  category: toOptionalString(50),
  alt: toOptionalString(200),
  isVisible: z.coerce.boolean(),
});

export async function createGalleryImage(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const parsed = createGallerySchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      alt: formData.get("alt"),
      isVisible: formData.get("isVisible") === "on",
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`Invalid gallery image (${issue?.path.join(".")}): ${issue?.message}`);
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("No image selected.");

    const media = await uploadMediaFile({
      file,
      bucket: "gallery",
      alt: parsed.data.alt || parsed.data.title || null,
      uploadedBy: user.id,
    });

    const supabase = await createClient();
    const { count } = await supabase
      .from("gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false);

    const { data: row, error } = await supabase
      .from("gallery_images")
      .insert({
        media_id: media.id,
        title: parsed.data.title || null,
        description: parsed.data.description || null,
        category: parsed.data.category || null,
        is_visible: parsed.data.isVisible,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error || !row) throw new Error("Failed to save gallery image: " + (error?.message ?? "unknown error"));

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "gallery_image",
      entity_id: row.id,
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { id: row.id };
  });
}
