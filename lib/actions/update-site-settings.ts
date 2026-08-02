"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";

const updateSiteSettingsSchema = z.object({
  hotelName: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(250).optional().or(z.literal("")),
  phone: z.string().trim().max(60).optional().or(z.literal("")),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  heroTitle: z.string().trim().max(200).optional().or(z.literal("")),
  heroSubtitle: z.string().trim().max(400).optional().or(z.literal("")),
  bookingUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  googleMapsUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  googlePlaceId: z.string().trim().max(200).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  facebook: z.string().trim().url().max(500).optional().or(z.literal("")),
  instagram: z.string().trim().url().max(500).optional().or(z.literal("")),
  tiktok: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export async function updateSiteSettings(input: unknown): Promise<ActionResult<void>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateSiteSettingsSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid site settings: " + parsed.error.issues[0]?.message);
    }

    const supabase = await createClient();
    const settings = parsed.data;

    const { error } = await supabase
      .from("site_settings")
      .update({
        hotel_name: settings.hotelName,
        tagline: settings.tagline || null,
        phone: settings.phone || null,
        email: settings.email || null,
        address: settings.address || null,
        hero_title: settings.heroTitle || null,
        hero_subtitle: settings.heroSubtitle || null,
        booking_url: settings.bookingUrl || null,
        google_maps_url: settings.googleMapsUrl || null,
        google_place_id: settings.googlePlaceId || null,
        whatsapp: settings.whatsapp || null,
        facebook: settings.facebook || null,
        instagram: settings.instagram || null,
        tiktok: settings.tiktok || null,
      })
      .eq("id", 1);

    if (error) throw new Error("Failed to update site settings: " + error.message);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "site_settings",
      entity_id: null,
    });

    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/testimonials");
  });
}

