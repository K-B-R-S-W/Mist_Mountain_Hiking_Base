# Mist Mountain Hiking Base — Website

Next.js (App Router) + TypeScript + Tailwind v4 + Supabase.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Gmail values
```

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql`, then `0002_site_assets_favicon.sql`, then `0003_google_reviews.sql` against it (SQL editor, or `supabase db push`).
3. Create the 5 storage buckets in the dashboard: `rooms`, `gallery`, `hero`, `testimonials`, `site` — the migration's storage policies reference these bucket ids.
4. Add yourself to `admin_users` **manually** in the SQL editor after creating your Supabase Auth user — this table has no client-writable policy on purpose:
   ```sql
   insert into admin_users (user_id, role) values ('<your-auth-user-id>', 'admin');
   ```
5. `npm run dev`.

## Email setup (Gmail SMTP)

The inquiry form sends to `GMAIL_USER` via `nodemailer`. Gmail requires an **App Password**, not your normal login password:

1. Enable 2-Step Verification on the Gmail account.
2. Google Account → Security → App passwords → generate one for "Mail".
3. Put that 16-character value in `GMAIL_APP_PASSWORD`.

## Google review sync

`lib/google/reviews.ts` pulls reviews via the Places API (New) Place Details endpoint. Two things to configure, both optional — the site works fine without them, the Testimonials admin page just shows the sync button as disabled:

1. Run `supabase/migrations/0003_google_reviews.sql`.
2. In Google Cloud Console, enable **Places API (New)** and create an API key (restrict it to that API). Put it in `GOOGLE_PLACES_API_KEY`.
3. In Admin → Settings → "Location & Google", set the **Google Place ID** for the business listing. Find it via Google's [Place ID finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
4. Trigger a sync manually from Admin → Testimonials → "Sync Google reviews", or let it run on a schedule (see below).

**Hard limit, not a bug**: Google's API returns at most the 5 most-relevant reviews per place — there's no pagination to fetch older ones. Re-syncing refreshes that top-5 window (ratings/text can change, new reviews can push old ones out); it does not accumulate a growing archive. If you need full review history, that has to come from Google Business Profile exports, not this API.

**Scheduled sync**: `vercel.json` defines a daily cron hitting `/api/cron/sync-google-reviews`, authenticated via `CRON_SECRET` (Vercel sends this automatically when the env var is set and the project is deployed on Vercel). Deploying elsewhere? Point any scheduler (GitHub Actions cron, Supabase pg_cron + `pg_net`, etc.) at that same URL with `Authorization: Bearer <CRON_SECRET>`.

Imported reviews land `is_approved: true` (they're already public) but `is_featured: false` — an admin still picks which ones surface on the homepage.

## Quick links & map

`whatsapp` / `facebook` / `instagram` / `tiktok` / `googleMapsUrl` were already columns on `site_settings` (see `0001_init.sql`) but had no admin UI until now — fill them in at Admin → Settings.

- **WhatsApp**: enter a phone number with country code (e.g. `+94 77 779 0674`); the site builds the `wa.me` link.
- **Google Maps embed URL**: don't paste the "share" link (`share.google/...` or `maps.app.goo.gl/...`) — those are redirects and Google blocks them from loading in an `<iframe>`. In Google Maps: search the property → Share → **Embed a map** tab → copy the URL inside `src="..."` and paste that. `components/site/google-map.tsx` also tolerates someone pasting the whole `<iframe>` tag by mistake, and falls back to a plain address-search embed if the field is empty but an address is set.

## Security model (read before adding new admin mutations)

Two independent layers, neither trusts the other:

- **`middleware.ts`** — UX only. Redirects an obviously-unauthenticated visitor away from `/admin/*`. This is *not* the security boundary (see CVE-2025-29927 — middleware bypass class of bug).
- **`lib/auth/require-admin.ts`** — the real boundary. Call `requireAdmin()` as the first line of every admin Server Action (see `lib/actions/update-room.ts` for the reference pattern). It independently re-verifies the session and `admin_users` membership — it does not assume the request already passed middleware.
- **RLS** — a third, DB-level backstop. Every table has `is_admin()`-based policies, so even a bug in the two layers above can't leak or corrupt data.

`admin_users` has zero client-writable RLS policies. New admins are added by hand via the SQL editor or `service_role` — never from the app.

## Public write path

`submitInquiry` (`lib/actions/submit-inquiry.ts`) is the one Server Action anonymous visitors can call. Defenses, in order: honeypot field → IP rate limit → zod validation → the `bookings` table's own `with check` constraint. No CAPTCHA for launch — add Cloudflare Turnstile later only if spam actually shows up in `/admin/bookings`.

> **Rate limiter caveat:** `lib/rate-limit/simple-rate-limit.ts` is an **in-memory, single-process** limiter (a plain `Map`). Correct for local dev and a single-instance/single-region deploy — each process has its own counters. **Not distributed**: run multiple instances/regions behind a load balancer and each one counts independently, so the effective limit multiplies by instance count. When you scale horizontally, swap it for `@upstash/ratelimit` (Redis-backed) — same call shape at the call site (`isRateLimited(key)`), nothing above it needs to change.

## Admin action error handling

Every admin Server Action returns a consistent `ActionResult<T>` (`{ ok: true, data } | { ok: false, error }`) via `lib/actions/with-admin-action.ts`, instead of throwing and letting Next.js turn it into a generic "Internal Server Error" on the client. `requireAdmin()` failures are caught inside the wrapper and surfaced as `{ ok: false, error: "Not authorized." }`. New admin actions should follow `lib/actions/update-room.ts` as the template — wrap the whole body in `withAdminAction(async ({ user }) => { ... })`.

## Constants

`lib/constants/` holds the fixed vocabularies used across the app (booking status, gallery category, admin role) so they're typed and imported, not scattered as string literals. Each file's comment states which DB check constraint it mirrors — keep them in sync if a migration ever changes those constraints.

## Project structure

Short version:

- `app/(site)` — public website routes (`/`, `/about`, `/rooms`, `/rooms/[slug]`, `/experiences`, `/gallery`, `/contact`, `/book`)
- `app/admin` — protected admin panel routes (`/admin`, `/admin/rooms`, `/admin/gallery`, `/admin/testimonials`, `/admin/bookings`, `/admin/media`, `/admin/settings`)
- `lib/repositories` — read-only Supabase data access layer for both public/admin surfaces
- `lib/actions` — Server Actions for writes (public inquiry submit + admin mutations)
