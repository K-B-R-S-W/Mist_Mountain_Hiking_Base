import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { Testimonial } from "@/lib/types/domain";

function mapTestimonial(row: {
  id: string;
  name: string;
  country: string | null;
  rating: number | null;
  quote: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  media_id: string | null;
  media_files: { url: string | null } | { url: string | null }[] | null;
  source: "manual" | "google";
  source_photo_url: string | null;
  review_url: string | null;
}): Testimonial {
  const media = Array.isArray(row.media_files) ? row.media_files[0] : row.media_files;

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    rating: row.rating,
    quote: row.quote,
    isApproved: row.is_approved,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    mediaId: row.media_id,
    photoUrl: media?.url ?? row.source_photo_url ?? null,
    source: row.source,
    reviewUrl: row.review_url,
  };
}

const TESTIMONIAL_SELECT =
  "id, name, country, rating, quote, is_approved, is_featured, created_at, media_id, media_files(url), source, source_photo_url, review_url";

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_SELECT)
    .eq("is_deleted", false)
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  assertNoError(error, "Failed to load testimonials");
  return (data ?? []).map(mapTestimonial);
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_SELECT)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  assertNoError(error, "Failed to load admin testimonials");
  return (data ?? []).map(mapTestimonial);
}
