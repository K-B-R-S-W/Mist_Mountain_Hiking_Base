import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { GalleryImage } from "@/lib/types/domain";

function mapGallery(row: {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  featured: boolean;
  is_visible: boolean;
  sort_order: number;
  media_id: string;
  media_files: { url: string | null; alt: string | null } | { url: string | null; alt: string | null }[] | null;
}): GalleryImage | null {
  const media = Array.isArray(row.media_files) ? row.media_files[0] : row.media_files;
  if (!media?.url) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    featured: row.featured,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    mediaId: row.media_id,
    url: media.url,
    alt: media.alt ?? null,
  };
}

export async function getVisibleGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, title, description, category, featured, is_visible, sort_order, media_id, media_files(url, alt)"
    )
    .eq("is_deleted", false)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load gallery");
  return (data ?? [])
    .map(mapGallery)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function getAdminGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, title, description, category, featured, is_visible, sort_order, media_id, media_files(url, alt)"
    )
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load admin gallery");
  return (data ?? [])
    .map(mapGallery)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

