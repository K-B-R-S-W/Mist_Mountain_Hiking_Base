import "server-only";

/**
 * Google Places API (New) — Place Details, `reviews` field only.
 *
 * Hard platform limit: Google returns at most 5 reviews per place, and
 * always its pick of "most relevant" — there is no pagination or "give
 * me review #6" endpoint. Re-running the sync doesn't grow a review
 * archive; it re-fetches that top-5 window, so new reviews appear (and
 * old ones can drop off) over time. That's what "auto fetch more in
 * future" resolves to on Google's side — full review history isn't
 * something the public API exposes at any price tier.
 *
 * Docs: https://developers.google.com/maps/documentation/places/web-service/place-details
 */

export type GooglePlaceReview = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number | null;
  text: string;
  reviewUrl: string | null;
  relativeTime: string | null;
};

type PlacesApiReview = {
  name: string; // "places/{placeId}/reviews/{reviewId}"
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  googleMapsUri?: string;
  relativePublishTimeDescription?: string;
};

type PlacesApiResponse = {
  reviews?: PlacesApiReview[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
};

export class GoogleReviewsConfigError extends Error {}

/**
 * Fetches up to 5 reviews for a Google Place. Throws
 * GoogleReviewsConfigError if the API key or place ID isn't configured
 * so callers can surface a clear "not set up yet" message instead of a
 * raw fetch failure.
 */
export async function fetchGooglePlaceReviews(placeId: string): Promise<{
  reviews: GooglePlaceReview[];
  overallRating: number | null;
  totalReviewCount: number | null;
  mapsUri: string | null;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new GoogleReviewsConfigError(
      "GOOGLE_PLACES_API_KEY is not set. Add it to the server environment to enable Google review sync."
    );
  }
  if (!placeId) {
    throw new GoogleReviewsConfigError(
      "No Google Place ID configured. Set it in Admin → Settings → Google Reviews."
    );
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places API request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as PlacesApiResponse;

  const reviews: GooglePlaceReview[] = (data.reviews ?? []).map((review) => {
    const idMatch = review.name?.match(/reviews\/(.+)$/);
    return {
      id: idMatch?.[1] ?? review.name ?? crypto.randomUUID(),
      authorName: review.authorAttribution?.displayName ?? "Google guest",
      authorPhotoUrl: review.authorAttribution?.photoUri ?? null,
      rating: typeof review.rating === "number" ? review.rating : null,
      text: review.text?.text ?? review.originalText?.text ?? "",
      reviewUrl: review.googleMapsUri ?? null,
      relativeTime: review.relativePublishTimeDescription ?? null,
    };
  });

  return {
    reviews,
    overallRating: typeof data.rating === "number" ? data.rating : null,
    totalReviewCount: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
    mapsUri: data.googleMapsUri ?? null,
  };
}
