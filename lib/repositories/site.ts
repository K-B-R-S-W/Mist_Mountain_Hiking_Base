import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { SiteBranding, SiteSettings } from "@/lib/types/domain";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "hotel_name, tagline, phone, whatsapp, email, address, facebook, instagram, tiktok, booking_url, google_maps_url, google_place_id, hero_title, hero_subtitle, seo_title, seo_description, copyright, about_intro, about_different, about_land, about_location, about_who_for, about_team, about_sustainability"
    )
    .eq("id", 1)
    .maybeSingle();

  assertNoError(error, "Failed to load site settings");

  return {
    hotelName: data?.hotel_name ?? "Mist Mountain Hiking Base",
    tagline: data?.tagline ?? null,
    phone: data?.phone ?? null,
    whatsapp: data?.whatsapp ?? null,
    email: data?.email ?? null,
    address: data?.address ?? null,
    facebook: data?.facebook ?? null,
    instagram: data?.instagram ?? null,
    tiktok: data?.tiktok ?? null,
    bookingUrl: data?.booking_url ?? null,
    googleMapsUrl: data?.google_maps_url ?? null,
    googlePlaceId: data?.google_place_id ?? null,
    heroTitle: data?.hero_title ?? null,
    heroSubtitle: data?.hero_subtitle ?? null,
    seoTitle: data?.seo_title ?? null,
    seoDescription: data?.seo_description ?? null,
    copyright: data?.copyright ?? null,
    aboutIntro: data?.about_intro ?? "",
    aboutDifferent: data?.about_different ?? "",
    aboutLand: data?.about_land ?? "",
    aboutLocation: data?.about_location ?? "",
    aboutWhoFor: data?.about_who_for ?? "",
    aboutTeam: data?.about_team ?? "",
    aboutSustainability: data?.about_sustainability ?? "",
  };
}

/**
 * Header logo + favicon + homepage editorial imagery (hero, Mist
 * Experience split section, Experiences teaser split section). One row
 * per type in site_assets; sort_order picks the active one if an admin
 * ever leaves more than one attached to the same slot. Missing type ->
 * null, callers fall back to the text wordmark / generated icon / solid
 * brand-color block.
 */
export async function getSiteBranding(): Promise<SiteBranding> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_assets")
    .select("type, sort_order, media_files(url, alt)")
    .in("type", ["logo", "favicon", "hero", "mist_experience", "experiences"])
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load site branding assets");

  const branding: SiteBranding = {
    logoUrl: null,
    logoAlt: null,
    faviconUrl: null,
    heroUrl: null,
    heroAlt: null,
    mistExperienceUrl: null,
    mistExperienceAlt: null,
    experiencesUrl: null,
    experiencesAlt: null,
  };
  for (const row of data ?? []) {
    const media = Array.isArray(row.media_files) ? row.media_files[0] : row.media_files;
    if (!media?.url) continue;
    if (row.type === "logo" && !branding.logoUrl) {
      branding.logoUrl = media.url;
      branding.logoAlt = media.alt ?? null;
    }
    if (row.type === "favicon" && !branding.faviconUrl) {
      branding.faviconUrl = media.url;
    }
    if (row.type === "hero" && !branding.heroUrl) {
      branding.heroUrl = media.url;
      branding.heroAlt = media.alt ?? null;
    }
    if (row.type === "mist_experience" && !branding.mistExperienceUrl) {
      branding.mistExperienceUrl = media.url;
      branding.mistExperienceAlt = media.alt ?? null;
    }
    if (row.type === "experiences" && !branding.experiencesUrl) {
      branding.experiencesUrl = media.url;
      branding.experiencesAlt = media.alt ?? null;
    }
  }
  return branding;
}