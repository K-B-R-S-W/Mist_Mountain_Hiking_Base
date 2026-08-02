import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Soft delete only — the storage object stays (cheap, and avoids breaking
 * any other row that still references this media_id). Mirrors the soft-delete
 * pattern used everywhere else in the schema. */
export async function softDeleteMediaFile(mediaId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("media_files")
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", mediaId);
  if (error) throw new Error(`Failed to delete media: ${error.message}`);
}
