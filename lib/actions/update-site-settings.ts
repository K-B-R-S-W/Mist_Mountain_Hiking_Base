"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { sanitizeRichText } from "@/lib/validation/sanitize-rich-text";

const toOptionalString = (max: number) =>
  z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const str = String(val).trim();
    return str === "" ? null : str;
  }, z.string().max(max).nullable().optional());

const toOptionalEmail = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  const str = String(val).trim();
  return str === "" ? null : str;
}, z.union([z.string().email("Please enter a valid email address").max(320), z.null(), z.undefined()]));

const toOptionalUrl = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  let str = String(val).trim();
  if (str === "") return null;
  if (!/^https?:\/\//i.test(str) && (str.includes(".") || str.includes("/"))) {
    str = `https://${str}`;
  }
  return str;
}, z.union([z.string().max(2000), z.null(), z.undefined()]));

const updateSiteSettingsSchema = z.object({
  hotelName: z.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const str = String(val).trim();
    return str === "" ? undefined : str;
  }, z.string().min(1, "Hotel name is required").max(200).optional()),
  tagline: toOptionalString(250),
  phone: toOptionalString(60),
  email: toOptionalEmail,
  address: toOptionalString(500),
  heroTitle: toOptionalString(200),
  heroSubtitle: toOptionalString(400),
  bookingUrl: toOptionalUrl,
  googleMapsUrl: toOptionalString(2000),
  googlePlaceId: toOptionalString(200),
  whatsapp: toOptionalString(30),
  facebook: toOptionalUrl,
  instagram: toOptionalUrl,
  tiktok: toOptionalUrl,
  aboutIntro: toOptionalString(10000),
  aboutDifferent: toOptionalString(10000),
  aboutLand: toOptionalString(10000),
  aboutLocation: toOptionalString(10000),
  aboutWhoFor: toOptionalString(10000),
  aboutTeam: toOptionalString(10000),
  aboutSustainability: toOptionalString(10000),
});

export async function updateSiteSettings(input: unknown): Promise<ActionResult<void>> {
  return withAdminAction(async ({ user }) => {
    const parsed = updateSiteSettingsSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`Invalid site settings (${issue?.path.join(".")}): ${issue?.message}`);
    }

    const supabase = await createClient();
    const settings = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (settings.hotelName !== undefined) updateData.hotel_name = settings.hotelName;
    if (settings.tagline !== undefined) updateData.tagline = settings.tagline;
    if (settings.phone !== undefined) updateData.phone = settings.phone;
    if (settings.email !== undefined) updateData.email = settings.email;
    if (settings.address !== undefined) updateData.address = settings.address;
    if (settings.heroTitle !== undefined) updateData.hero_title = settings.heroTitle;
    if (settings.heroSubtitle !== undefined) updateData.hero_subtitle = settings.heroSubtitle;
    if (settings.bookingUrl !== undefined) updateData.booking_url = settings.bookingUrl;
    if (settings.googleMapsUrl !== undefined) updateData.google_maps_url = settings.googleMapsUrl;
    if (settings.googlePlaceId !== undefined) updateData.google_place_id = settings.googlePlaceId;
    if (settings.whatsapp !== undefined) updateData.whatsapp = settings.whatsapp;
    if (settings.facebook !== undefined) updateData.facebook = settings.facebook;
    if (settings.instagram !== undefined) updateData.instagram = settings.instagram;
    if (settings.tiktok !== undefined) updateData.tiktok = settings.tiktok;
    if (settings.aboutIntro !== undefined) updateData.about_intro = sanitizeRichText(settings.aboutIntro || "");
    if (settings.aboutDifferent !== undefined) updateData.about_different = sanitizeRichText(settings.aboutDifferent || "");
    if (settings.aboutLand !== undefined) updateData.about_land = sanitizeRichText(settings.aboutLand || "");
    if (settings.aboutLocation !== undefined) updateData.about_location = sanitizeRichText(settings.aboutLocation || "");
    if (settings.aboutWhoFor !== undefined) updateData.about_who_for = sanitizeRichText(settings.aboutWhoFor || "");
    if (settings.aboutTeam !== undefined) updateData.about_team = sanitizeRichText(settings.aboutTeam || "");
    if (settings.aboutSustainability !== undefined) updateData.about_sustainability = sanitizeRichText(settings.aboutSustainability || "");

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("site_settings").update(updateData).eq("id", 1);
      if (error) throw new Error("Failed to update site settings: " + error.message);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "site_settings",
      entity_id: null,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/testimonials");
  });
}
