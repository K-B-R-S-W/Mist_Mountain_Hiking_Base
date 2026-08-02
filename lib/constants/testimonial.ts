/** Mirrors the `source` check constraint on `testimonials` (0003_google_reviews.sql). */
export const TESTIMONIAL_SOURCE = {
  MANUAL: "manual",
  GOOGLE: "google",
} as const;

export type TestimonialSource = (typeof TESTIMONIAL_SOURCE)[keyof typeof TESTIMONIAL_SOURCE];
