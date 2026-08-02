"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withAdminAction, type ActionResult } from "@/lib/actions/with-admin-action";
import { fetchGooglePlaceReviews, GoogleReviewsConfigError } from "@/lib/google/reviews";
import { TESTIMONIAL_SOURCE } from "@/lib/constants";

/**
 * Pulls the current top-5 Google reviews for the configured Place ID and
 * upserts them into `testimonials` keyed on `google_review_id`, so
 * re-running this never creates duplicates — it just refreshes text/
 * rating/photo on existing rows and inserts any new ones. Imported
 * reviews land pre-approved (they're already public on Google) but not
 * featured; an admin still chooses which ones go on the homepage.
 */
export async function syncGoogleReviews(): Promise<
  ActionResult<{ imported: number; updated: number; skipped: number }>
> {
  return withAdminAction(async ({ user }) => {
    const supabase = await createClient();

    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("google_place_id")
      .eq("id", 1)
      .maybeSingle();
    if (settingsError) throw new Error("Failed to load settings: " + settingsError.message);

    const placeId = settings?.google_place_id?.trim();
    if (!placeId) {
      throw new Error(
        "No Google Place ID set. Add it in Settings → Google Reviews first."
      );
    }

    let result;
    try {
      result = await fetchGooglePlaceReviews(placeId);
    } catch (err) {
      if (err instanceof GoogleReviewsConfigError) throw err;
      throw new Error("Google review sync failed: " + (err instanceof Error ? err.message : "unknown error"));
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const review of result.reviews) {
      if (!review.text.trim()) {
        skipped++;
        continue;
      }

      const { data: existing } = await supabase
        .from("testimonials")
        .select("id")
        .eq("google_review_id", review.id)
        .maybeSingle();

      const { error: upsertError } = await supabase.from("testimonials").upsert(
        {
          google_review_id: review.id,
          name: review.authorName,
          rating: review.rating,
          quote: review.text.slice(0, 1000),
          source: TESTIMONIAL_SOURCE.GOOGLE,
          source_photo_url: review.authorPhotoUrl,
          review_url: review.reviewUrl,
          is_approved: true,
          is_deleted: false,
        },
        { onConflict: "google_review_id" }
      );

      if (upsertError) {
        skipped++;
        continue;
      }
      if (existing) updated++;
      else imported++;
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "sync",
      entity: "google_reviews",
      entity_id: null,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { imported, updated, skipped };
  });
}
