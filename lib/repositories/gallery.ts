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

/**
 * Homepage "Experiences" 3D carousel source. Same table as the main
 * gallery — the admin just tags photos with category="experiences" in
 * the existing Gallery admin instead of a dedicated upload flow — so no
 * new admin UI or table was needed for this. Capped at 10: the carousel
 * only ever keeps a couple of planes mounted either side of the active
 * one, so anything beyond this is just unused fetched weight.
 */
export async function getExperienceCircuitImages(): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, title, description, category, featured, is_visible, sort_order, media_id, media_files(url, alt)"
    )
    .eq("is_deleted", false)
    .eq("is_visible", true)
    .eq("category", "experiences")
    .order("sort_order", { ascending: true })
    .limit(10);

  assertNoError(error, "Failed to load experience circuit images");
  return (data ?? [])
    .map(mapGallery)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

/**
 * /experiences page content — Tourism Circuit, Working Plantation, and
 * Natural Springs sections. Same gallery_images table, tagged
 * category="attraction" | "plantation" | "springs" in the admin Gallery
 * screen — one query, grouped client-side, so adding/reordering/hiding a
 * card is just editing a gallery row (no dedicated admin screen, no
 * migration). See GALLERY_CATEGORIES in lib/constants/gallery.ts.
 */
export type ExperiencePageContent = {
  attractions: GalleryImage[];
  plantation: GalleryImage[];
  springs: GalleryImage[];
};

export async function getExperiencePageContent(): Promise<ExperiencePageContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, title, description, category, featured, is_visible, sort_order, media_id, media_files(url, alt)"
    )
    .eq("is_deleted", false)
    .eq("is_visible", true)
    .in("category", ["attraction", "plantation", "springs"])
    .order("sort_order", { ascending: true });

  assertNoError(error, "Failed to load experiences page content");
  const images = (data ?? [])
    .map(mapGallery)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    attractions: images.filter((image) => image.category === "attraction"),
    plantation: images.filter((image) => image.category === "plantation"),
    springs: images.filter((image) => image.category === "springs"),
  };
}

