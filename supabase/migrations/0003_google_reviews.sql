-- Google Reviews auto-sync + site settings additions.
--
-- testimonials gains a `source` so manually-entered guest quotes and
-- Google-imported reviews can coexist in one list/moderation queue.
-- `google_review_id` is unique so re-running the sync upserts instead of
-- duplicating; Google's Place Details API only ever returns up to five
-- reviews per place (a hard platform limit, not something we can page
-- past), so "auto fetch more in future" means "re-sync picks up new
-- reviews as they enter that top-5 window", not full review history.

alter table testimonials
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'google')),
  add column if not exists google_review_id text unique,
  add column if not exists source_photo_url text,
  add column if not exists review_url text;

comment on column testimonials.source is
  'manual = entered in admin; google = imported via Google Places API sync.';
comment on column testimonials.google_review_id is
  'Stable id Google assigns a review; unique so re-sync upserts, never duplicates.';
comment on column testimonials.source_photo_url is
  'Reviewer avatar URL for google-sourced testimonials (external, not in media_files).';

alter table site_settings
  add column if not exists google_place_id text;

comment on column site_settings.google_place_id is
  'Google Place ID for the "Mist Mountain Hiking Base" listing, used by the Google review sync.';
