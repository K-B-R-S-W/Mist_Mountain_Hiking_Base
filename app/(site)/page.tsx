import Link from "next/link";
import Image from "next/image";
import {
  getApprovedTestimonials,
  getSiteBranding,
  getSiteSettings,
  getVisibleRooms,
} from "@/lib/repositories";
import { GuestStoriesCarousel } from "@/components/site/guest-stories-carousel";

export default async function HomePage() {
  const [rooms, testimonials, settings, branding] = await Promise.all([
    getVisibleRooms(),
    getApprovedTestimonials(),
    getSiteSettings(),
    getSiteBranding(),
  ]);
  const featuredRooms = rooms.filter((room) => room.featured).slice(0, 3);
  // Only 5-star, admin-featured reviews go on the homepage highlight reel.
  const featuredTestimonials = testimonials.filter((item) => item.isFeatured && item.rating === 5);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-primary px-6 pb-16 text-background md:px-10 md:min-h-[85vh]">
        {branding.heroUrl ? (
          <>
            <Image
              src={branding.heroUrl}
              alt={branding.heroAlt ?? settings.hotelName}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-primary/10"
              aria-hidden
            />
          </>
        ) : null}
        <div className="relative max-w-xl">
          <p className="mb-4 text-xs tracking-[0.2em] text-background/70">
            UDAHAWATTE · PIMBURA · RATHNAPURA
          </p>
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-medium leading-tight md:text-6xl">
            {settings.heroTitle ?? "A working plantation. Two living springs. One quiet mountain."}
          </h1>
          <p className="mt-4 max-w-md text-background/80">
            {settings.heroSubtitle ?? "Two hours from Colombo, and a world from it."}
          </p>
        </div>
      </section>

      <div className="contour-divider" />

      {/* Quick facts strip — flat color panel, same device as the reference screenshots */}
      <section className="bg-secondary text-background">
        <div className="page-shell grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Spring pools", value: "2 natural, chemical-free" },
            { label: "From Colombo", value: "2.5 hrs via Horana Rd" },
            { label: "On-site", value: "Working tea & spice plantation" },
            { label: "Guides", value: "Locally hired, trail-trained" },
          ].map((fact) => (
            <div key={fact.label}>
              <p className="text-xs tracking-[0.2em] text-background/60">{fact.label.toUpperCase()}</p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-lg">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-8 bg-background md:h-12" aria-hidden />

      {/* The Mist Experience */}
      <section className="grid md:grid-cols-2">
        <div className="relative h-[320px] overflow-hidden bg-secondary md:h-[460px]">
          {branding.mistExperienceUrl ? (
            <Image
              src={branding.mistExperienceUrl}
              alt={branding.mistExperienceAlt ?? "Spring-fed bathing pool at Mist Mountain"}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center px-6 py-12 md:h-[460px] md:px-16 md:py-0">
          <p className="mb-3 text-xs tracking-[0.2em] text-muted">
            THE MIST EXPERIENCE
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
            Spring water, gravity-fed and always cold
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-text/80">
            Two natural springs feed rock-lined pools with no pumps and no
            chemicals — just cool, moving water below the mist line.
          </p>
        </div>
      </section>

      {/* Rooms teaser */}
      <section className="panel-accent-tint py-16">
        <div className="page-shell">
          <p className="mb-3 text-xs tracking-[0.2em] text-muted">STAY</p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
            Tiered decks, built into the mountain
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredRooms.map((room) => (
              <article key={room.id} className="card overflow-hidden p-0">
                <div className="relative aspect-[4/3] bg-black/5">
                  {room.primaryImageUrl ? (
                    <Image
                      src={room.primaryImageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="text-lg">{room.name}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {room.shortDescription ?? "Quiet mountain-facing deck stay."}
                  </p>
                  <p className="mt-3 text-sm">
                    Up to {room.maxGuests} guests · from LKR {room.basePrice.toLocaleString()}
                  </p>
                  <Link href={`/rooms/${room.slug}`} className="link-inline mt-4 inline-block">
                    View room
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link
            href="/rooms"
            className="link-inline mt-6 inline-block"
          >
            See all rooms
          </Link>
        </div>
      </section>

      {/* Experiences teaser */}
      <section className="grid md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-6 py-12 md:order-1 md:h-[460px] md:px-16 md:py-0">
          <p className="mb-3 text-xs tracking-[0.2em] text-muted">
            EXPERIENCES
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
            A hub for the real Pimbura circuit
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-text/80">
            Pahiyangala Caves, four waterfalls, the Thalapathgala rock plain,
            and the Paragala &ldquo;Vanishing River&rdquo; tunnel — all reachable
            from here.
          </p>
          <ul className="mt-8 space-y-2 border-t border-black/8 pt-6 text-sm text-text/80">
            <li>Pahiyangala Caves</li>
            <li>Dumbara graphite mines</li>
            <li>Four waterfalls &amp; the Thalapathgala rock plain</li>
            <li>Kakuluwa Raja Maha Viharaya — exclusive 4x4 transport</li>
          </ul>
          <Link
            href="/experiences"
            className="mt-6 inline-block text-sm font-medium text-accent underline underline-offset-4"
          >
            Explore the circuit
          </Link>
        </div>
        <div className="relative order-1 h-[320px] overflow-hidden bg-accent md:order-2 md:h-[460px]">
          {branding.experiencesUrl ? (
            <Image
              src={branding.experiencesUrl}
              alt={branding.experiencesAlt ?? "Hiking circuit near Mist Mountain"}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
      </section>

      {/* Location */}
      <section className="panel-accent-tint py-16">
        <div className="page-shell">
          <p className="mb-3 text-xs tracking-[0.2em] text-muted">GETTING HERE</p>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
            2.5 hours from Colombo via Horana Road
          </h2>
          <Link href="/contact" className="link-inline mt-4 inline-block">
            Map &amp; directions
          </Link>
        </div>
      </section>

      <section className="bg-secondary py-12 text-background">
        <div className="page-shell">
          <p className="mb-6 text-xs tracking-[0.2em] text-background/60">GUEST STORIES</p>
          <GuestStoriesCarousel testimonials={featuredTestimonials} />
        </div>
      </section>
    </>
  );
}