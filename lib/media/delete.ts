import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Soft delete only — the storage object stays (cheap, and avoids breaking
 * any other row that still references this media_id). Mirrors the soft-delete
 * pattern used everywhere else in the schema. */
export async function softDeleteMediaFile(mediaId: string) {
  const supabase = await createClient();

  // 1. room_images: media_id is NOT NULL (composite PK) -> delete referencing rows
  await supabase.from("room_images").delete().eq("media_id", mediaId);

  // 2. gallery_images: media_id is NOT NULL -> delete referencing rows
  await supabase.from("gallery_images").delete().eq("media_id", mediaId);

  // 3. testimonials: media_id is nullable -> unlink
  await supabase.from("testimonials").update({ media_id: null }).eq("media_id", mediaId);

  // 4. site_assets: media_id is NOT NULL -> delete referencing rows
  await supabase.from("site_assets").delete().eq("media_id", mediaId);

  // 5. soft-delete media_files row
  const { error } = await supabase
    .from("media_files")
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", mediaId);
  if (error) throw new Error(`Failed to delete media: ${error.message}`);
}
