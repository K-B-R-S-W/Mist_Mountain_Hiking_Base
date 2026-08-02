"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { uploadMediaFile, type MediaBucket } from "@/lib/media/upload";
import type { MediaFile } from "@/lib/types/domain";

const ALLOWED_BUCKETS: MediaBucket[] = ["rooms", "gallery", "hero", "testimonials", "site"];

export async function uploadMedia(formData: FormData): Promise<ActionResult<MediaFile>> {
  return withAdminAction(async ({ user }) => {
    const file = formData.get("file");
    const bucket = formData.get("bucket");
    const alt = formData.get("alt");

    if (!(file instanceof File) || file.size === 0) throw new Error("No file provided.");
    if (typeof bucket !== "string" || !ALLOWED_BUCKETS.includes(bucket as MediaBucket)) {
      throw new Error("Invalid media bucket.");
    }

    const media = await uploadMediaFile({
      file,
      bucket: bucket as MediaBucket,
      alt: typeof alt === "string" ? alt : null,
      uploadedBy: user.id,
    });

    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "media",
      entity_id: media.id,
    });

    revalidatePath("/admin/media");
    return media;
  });
}
