import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { MediaFile } from "@/lib/types/domain";

export async function getAdminMediaFiles(): Promise<MediaFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_files")
    .select("id, bucket, path, url, alt, created_at, is_deleted")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  assertNoError(error, "Failed to load media files");
  return (data ?? []).map((row) => ({
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    url: row.url,
    alt: row.alt,
    createdAt: row.created_at,
    isDeleted: row.is_deleted,
  }));
}

