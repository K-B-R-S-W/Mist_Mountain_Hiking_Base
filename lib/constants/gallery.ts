/**
 * `gallery_images.category` is a free-text column (spec.md §6), not a DB
 * enum — these are the values the admin UI offers so tags stay consistent
 * without a schema migration every time a new category is needed.
 */
export const GALLERY_CATEGORIES = {
  ROOMS: "rooms",
  NATURE: "nature",
  GUESTS: "guests",
  PLANTATION: "plantation",
  EXPERIENCES: "experiences",
  ATTRACTION: "attraction",
  SPRINGS: "springs",
} as const;

export type GalleryCategory =
  (typeof GALLERY_CATEGORIES)[keyof typeof GALLERY_CATEGORIES];
