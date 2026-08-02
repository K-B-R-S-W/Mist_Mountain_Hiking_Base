import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/service";
import { fetchGooglePlaceReviews, GoogleReviewsConfigError } from "@/lib/google/reviews";
import { TESTIMONIAL_SOURCE } from "@/lib/constants";

/**
 * Scheduled version of `syncGoogleReviews` for unattended runs (Vercel
 * Cron — see vercel.json). Not a Server Action because nothing signed
 * in triggers it; auth here is a shared secret, not a Supabase session,
 * so it uses the service-role client directly rather than requireAdmin().
 *
 * Protect with CRON_SECRET: Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET` automatically when the env var is
 * set. Any other unattended scheduler (GitHub Actions, Supabase
 * pg_cron + Edge Function, etc.) works the same way — just send that
 * header.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("google_place_id")
    .eq("id", 1)
    .maybeSingle();
  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const placeId = settings?.google_place_id?.trim();
  if (!placeId) {
    return NextResponse.json({ skipped: "No Google Place ID configured" }, { status: 200 });
  }

  try {
    const result = await fetchGooglePlaceReviews(placeId);
    let imported = 0;
    let updated = 0;

    for (const review of result.reviews) {
      if (!review.text.trim()) continue;

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
      if (upsertError) continue;
      if (existing) updated++;
      else imported++;
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return NextResponse.json({ imported, updated, total: result.reviews.length });
  } catch (err) {
    if (err instanceof GoogleReviewsConfigError) {
      return NextResponse.json({ error: err.message }, { status: 200 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
