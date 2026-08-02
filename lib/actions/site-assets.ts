"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { uploadMediaFile, type MediaBucket } from "@/lib/media/upload";

const ASSET_TYPES = ["logo", "favicon", "hero", "mist_experience", "experiences"] as const;
type SiteAssetType = (typeof ASSET_TYPES)[number];

const typeSchema = z.enum(ASSET_TYPES);

// Which storage bucket + default alt text each homepage/branding slot
// uses. "hero" gets its own provisioned bucket (0001_init.sql); the
// smaller editorial section images share the general "site" bucket
// with logo/favicon rather than provisioning a bucket per section.
const ASSET_CONFIG: Record<SiteAssetType, { bucket: MediaBucket; label: string; defaultAlt: string }> = {
  logo: { bucket: "site", label: "logo", defaultAlt: "Mist Mountain Hiking Base logo" },
  favicon: { bucket: "site", label: "favicon", defaultAlt: "Mist Mountain Hiking Base favicon" },
  hero: { bucket: "hero", label: "hero image", defaultAlt: "Mist Mountain Hiking Base" },
  mist_experience: {
    bucket: "site",
    label: "Mist Experience image",
    defaultAlt: "Spring-fed bathing pool at Mist Mountain Hiking Base",
  },
  experiences: {
    bucket: "site",
    label: "Experiences image",
    defaultAlt: "Hiking circuit near Mist Mountain Hiking Base",
  },
};

/**
 * Replaces whichever image currently fills a homepage/branding slot
 * ("logo", "favicon", "hero", "mist_experience", "experiences") with a
 * newly uploaded one. Each slot holds at most one media_id at a time —
 * the previous site_assets link is dropped (the media_files row itself
 * is left alone; it's harmless if unreferenced and stays in the media
 * library like any other upload).
 */
export async function setSiteAsset(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return withAdminAction(async ({ user }) => {
    const typeParsed = typeSchema.safeParse(formData.get("type"));
    if (!typeParsed.success) throw new Error("Invalid asset type.");
    const type: SiteAssetType = typeParsed.data;
    const config = ASSET_CONFIG[type];

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error(`No ${config.label} selected.`);
    }

    const media = await uploadMediaFile({
      file,
      bucket: config.bucket,
      alt: config.defaultAlt,
      uploadedBy: user.id,
    });

    const supabase = await createClient();

    const { error: deleteError } = await supabase.from("site_assets").delete().eq("type", type);
    if (deleteError) throw new Error(`Failed to clear previous ${config.label}: ${deleteError.message}`);

    const { error: insertError } = await supabase
      .from("site_assets")
      .insert({ type, media_id: media.id, sort_order: 0 });
    if (insertError) throw new Error(`Failed to save ${config.label}: ${insertError.message}`);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity: "site_asset",
      entity_id: media.id,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { url: media.url };
  });
}

export async function removeSiteAsset(input: unknown): Promise<ActionResult<void>> {
  return withAdminAction(async ({ user }) => {
    const parsed = typeSchema.safeParse(input);
    if (!parsed.success) throw new Error("Invalid asset type.");
    const config = ASSET_CONFIG[parsed.data];

    const supabase = await createClient();
    const { error } = await supabase.from("site_assets").delete().eq("type", parsed.data);
    if (error) throw new Error(`Failed to remove ${config.label}: ${error.message}`);

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity: "site_asset",
      entity_id: null,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  });
}
