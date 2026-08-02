import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MediaFile } from "@/lib/types/domain";

// Mirrors the five buckets provisioned in 0001_init.sql storage policies.
const MEDIA_BUCKETS = ["rooms", "gallery", "hero", "testimonials", "site"] as const;
export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Single upload path shared by every admin surface that accepts an image
 * (media library, room images, and future gallery/testimonial/site-asset
 * uploads). Writes storage first, then the media_files row — on a DB
 * failure the storage object is removed so nothing orphaned survives.
 *
 * Relies on RLS (storage + media_files admin policies), not a service-role
 * key — the caller's own admin session does the write, consistent with the
 * rest of the app's "every write goes through RLS" model.
 */
export async function uploadMediaFile({
  file,
  bucket,
  alt,
  uploadedBy,
}: {
  file: File;
  bucket: MediaBucket;
  alt?: string | null;
  uploadedBy: string;
}): Promise<MediaFile> {
  if (!MEDIA_BUCKETS.includes(bucket)) {
    throw new Error(`Unknown media bucket: ${bucket}`);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image is too large (8MB max).");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  const { data: row, error: insertError } = await supabase
    .from("media_files")
    .insert({
      bucket,
      path,
      url: publicUrlData.publicUrl,
      alt: alt || null,
      uploaded_by: uploadedBy,
    })
    .select("id, bucket, path, url, alt, created_at, is_deleted")
    .single();

  if (insertError || !row) {
    await supabase.storage.from(bucket).remove([path]);
    throw new Error(`Failed to save media record: ${insertError?.message ?? "unknown error"}`);
  }

  return {
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    url: row.url,
    alt: row.alt,
    createdAt: row.created_at,
    isDeleted: row.is_deleted,
  };
}
