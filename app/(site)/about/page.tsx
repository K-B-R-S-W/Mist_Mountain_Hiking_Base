import { getSiteSettings } from "@/lib/repositories";

/**
 * Each section renders from site_settings.about_* (admin-editable, see
 * /admin/settings) when filled in, and falls back to this static default
 * copy otherwise — so the page never looks empty/broken before an admin
 * has written real content, and a section can be reset just by clearing
 * the field in admin rather than needing a code change.
 *
 * about_* values are sanitized server-side on save
 * (lib/validation/sanitize-rich-text.ts) to a small allowlist
 * (p/strong/em/ul/ol/li/br/h3, no attributes) before they ever reach the
 * database, so rendering them here via dangerouslySetInnerHTML is safe —
 * this page must never receive unsanitized input directly.
 */
const DEFAULTS = {
  intro:
    "Mist Mountain Hiking Base is a family-run eco-camping and agro-tourism retreat in Udahawatte, Pimbura — built around two natural spring-fed pools and a working tea, cinnamon, pepper, and coconut plantation. We build non-intrusively, using the land's existing contours, tree canopy, and spring flow rather than heavy concrete construction.",
  different:
    "Mist Mountain sits on a working tea-and-cinnamon landscape in Pimbura. The stay is designed around real terrain, local routes, and slower mountain days.",
  land: "Guests can take part in the plantation itself — morning tea plucking, cinnamon peeling demonstrations, fresh pepper harvest, and a welcome coconut cut straight from the tree you're camping under.",
  location:
    "Udahawaththa Bungalow, Pimbura, Karavita Road, Pimbura 70470 — about 2.5 hours from Colombo via the Horana Road, on the edge of the Sinharaja rain forest buffer zone.",
  whoFor:
    "Local and international travelers alike — weekend visitors from Colombo, hiking groups, and families. Stays aren't restricted to a fixed length; any day is possible.",
  team: "Our team is hired locally from Udahawatte and Pimbura, bringing real knowledge of the terrain, weather, and trails guests won't find in a guidebook.",
  sustainability:
    "Both springs are gravity-fed — no pumps, no chemicals — and pool overflow irrigates the coconut and cinnamon plantings instead of going to waste.",
};

function Section({
  eyebrow,
  fallback,
  html,
}: {
  eyebrow: string;
  fallback: string;
  html: string;
}) {
  return (
    <article className="card">
      <h2 className="text-xl">{eyebrow}</h2>
      {html ? (
        <div className="rich-text mt-3 text-muted" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="mt-3 text-muted">{fallback}</p>
      )}
    </article>
  );
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">ABOUT MIST MOUNTAIN</p>
      <h1 className="mt-3 text-3xl md:text-5xl">
        A family-run hiking base rooted in plantation land and spring water.
      </h1>

      {settings.aboutIntro ? (
        <div
          className="rich-text mt-6 max-w-2xl text-muted"
          dangerouslySetInnerHTML={{ __html: settings.aboutIntro }}
        />
      ) : (
        <p className="mt-6 max-w-2xl text-muted">{DEFAULTS.intro}</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Section
          eyebrow="What makes it different"
          fallback={DEFAULTS.different}
          html={settings.aboutDifferent}
        />
        <Section eyebrow="The land" fallback={DEFAULTS.land} html={settings.aboutLand} />
        <Section
          eyebrow="Location & access"
          fallback={DEFAULTS.location}
          html={settings.aboutLocation}
        />
        <Section eyebrow="Who it's for" fallback={DEFAULTS.whoFor} html={settings.aboutWhoFor} />
        <Section eyebrow="Our team" fallback={DEFAULTS.team} html={settings.aboutTeam} />
        <Section
          eyebrow="Sustainability"
          fallback={DEFAULTS.sustainability}
          html={settings.aboutSustainability}
        />
      </div>
    </div>
  );
}
