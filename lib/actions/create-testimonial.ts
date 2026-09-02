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

const createTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  country: toOptionalString(100),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  quote: z.string().trim().min(1, "Quote is required").max(1000),
  isApproved: z.coerce.boolean(),
});

export async function createTestimonial(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return withAdminAction(async ({ user }) => {
    const ratingRaw = formData.get("rating");
    const parsed = createTestimonialSchema.safeParse({
      name: formData.get("name"),
      country: formData.get("country"),
      rating: ratingRaw ? ratingRaw : undefined,
      quote: formData.get("quote"),
      isApproved: formData.get("isApproved") === "on",
    });
    if (!parsed.success) {
      throw new Error("Invalid testimonial: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();

    let mediaId: string | null = null;
    const file = formData.get("photo");
    if (file instanceof File && file.size > 0) {
      const media = await uploadMediaFile({
        file,
        bucket: "testimonials",
        alt: `${parsed.data.name} — guest photo`,
        uploadedBy: user.id,
      });
      mediaId = media.id;
    }

    const { data: row, error } = await supabase
      .from("testimonials")
      .insert({
        name: parsed.data.name,
        country: parsed.data.country || null,
        rating: parsed.data.rating ?? null,
        quote: parsed.data.quote,
        media_id: mediaId,
        is_approved: parsed.data.isApproved,
        is_featured: false,
      })
      .select("id")
      .single();

    if (error || !row) throw new Error("Failed to save testimonial: " + (error?.message ?? "unknown error"));

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "testimonial",
      entity_id: row.id,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { id: row.id };
  });
}
