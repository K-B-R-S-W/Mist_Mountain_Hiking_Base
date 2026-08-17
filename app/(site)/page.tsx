import Image from "next/image";
import { TransitionLink } from "@/components/site/motion/transition-link";
import {
  getApprovedTestimonials,
  getExperienceCircuitImages,
  getSiteBranding,
  getSiteSettings,
  getVisibleRooms,
} from "@/lib/repositories";
import { GuestStoriesCarousel } from "@/components/site/guest-stories-carousel";
import { RoomCard } from "@/components/site/room-card";
import { Reveal } from "@/components/site/motion/reveal";
import { ClipReveal } from "@/components/site/motion/clip-reveal";
import { Stagger, StaggerItem } from "@/components/site/motion/stagger";
import { HeroImageReveal } from "@/components/site/motion/hero-image-reveal";
import { HeroTextReveal } from "@/components/site/motion/hero-text-reveal";
import { LocationPanel } from "@/components/site/location-panel";
import { ExperienceCarousel } from "@/components/site/experience-carousel";

export default async function HomePage() {
  const [rooms, testimonials, settings, branding, experienceImages] = await Promise.all([
    getVisibleRooms(),
    getApprovedTestimonials(),
    getSiteSettings(),
    getSiteBranding(),
    getExperienceCircuitImages(),
  ]);
  const featuredRooms = rooms.filter((room) => room.featured).slice(0, 3);
  // Admin-featured reviews go on the homepage highlight reel.
  const featuredTestimonials = testimonials.filter((item) => item.isFeatured);
  // Carousel wants several photos (admin tags them category="experiences"
  // in the Gallery admin); until any exist, fall back to the single
  // Homepage Imagery "Experiences" asset so the section never goes empty.
  const experienceCarouselImages =
    experienceImages.length > 0
      ? experienceImages.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt ?? image.title ?? "Hiking circuit near Mist Mountain",
      }))
      : branding.experiencesUrl
        ? [
          {
            id: "fallback-experiences",
            url: branding.experiencesUrl,
            alt: branding.experiencesAlt ?? "Hiking circuit near Mist Mountain",
          },
        ]
        : [];

  return (
    <>
      {/* Hero — the one place a produced, multi-beat sequence is earned.
          Image settle + text stagger are isolated client components;
          the page itself stays a Server Component. */}
      <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-primary px-6 pb-16 text-background md:px-10 md:min-h-[85vh]">
        {branding.heroUrl ? (
          <>
            <HeroImageReveal>
              <Image
                src={branding.heroUrl}
                alt={branding.heroAlt ?? settings.hotelName}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </HeroImageReveal>
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-primary/10"
              aria-hidden
            />
          </>
        ) : null}
        <HeroTextReveal
          eyebrow="UDAHAWATTE · PIMBURA · RATHNAPURA"
          title={settings.heroTitle ?? "A working plantation. Two living springs. One quiet mountain."}
          subtitle={settings.heroSubtitle ?? "Two hours from Colombo, and a world from it."}
        />
      </section>

      <div className="contour-divider" />

      {/* Quick facts strip — light per-item stagger, barely perceptible;
          this is a data strip, not a story beat. */}
      <section className="bg-secondary text-background">
        <Stagger className="page-shell grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4" stagger={0.05}>
          {[
            { label: "Spring pools", value: "2 natural, chemical-free" },
            { label: "From Colombo", value: "2.5 hrs via Horana Rd" },
            { label: "On-site", value: "Working tea & spice plantation" },
            { label: "Guides", value: "Locally hired, trail-trained" },
          ].map((fact) => (
            <StaggerItem key={fact.label} rise={6}>
              <p className="text-xs tracking-[0.2em] text-background/60">{fact.label.toUpperCase()}</p>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-lg">{fact.value}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <div className="h-8 bg-background md:h-12" aria-hidden />

      {/* The Mist Experience — image wipes in from the left, text follows
          once the photo is mostly revealed (photo-first sequencing). */}
      <section className="grid md:grid-cols-2">
        <div className="relative h-[320px] overflow-hidden bg-secondary md:h-[460px]">
          <ClipReveal direction="left" duration={0.7} className="relative h-full w-full">
            {branding.mistExperienceUrl ? (
              <Image
                src={branding.mistExperienceUrl}
                alt={branding.mistExperienceAlt ?? "Spring-fed bathing pool at Mist Mountain"}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : null}
          </ClipReveal>
        </div>
        <Reveal
          variant="fade-rise"
          delay={0.35}
          className="flex flex-col justify-center px-6 py-12 md:h-[460px] md:px-16 md:py-0"
        >
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
        </Reveal>
      </section>

      {/* Rooms teaser — a genuine list of distinct choices, so a light
          per-card stagger is earned here. */}
      <section className="panel-accent-tint py-16">
        <div className="page-shell">
          <Reveal variant="fade" duration={0.4}>
            <p className="mb-3 text-xs tracking-[0.2em] text-muted">STAY</p>
            <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
              Tiered decks, built into the mountain
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-5 md:grid-cols-3" stagger={0.07}>
            {featuredRooms.map((room) => (
              <StaggerItem key={room.id} className="h-full">
                <RoomCard room={room} sizes="(min-width: 768px) 33vw, 100vw" headingLevel="h3" />
              </StaggerItem>
            ))}
          </Stagger>
          <TransitionLink
            href="/rooms"
            label="Rooms"
            className="link-inline mt-6 inline-block"
          >
            See all rooms
          </TransitionLink>
        </div>
      </section>

      {/* Experiences teaser — mirrored layout, so the image wipe comes
          from the opposite edge to match which side the photo sits on. */}
      <section className="grid md:grid-cols-2">
        <Reveal
          variant="fade-rise"
          delay={0.35}
          className="order-2 flex flex-col justify-center px-6 py-12 md:order-1 md:h-[460px] md:px-16 md:py-0"
        >
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
          <TransitionLink
            href="/experiences"
            label="Experiences"
            className="mt-6 inline-block text-sm font-medium text-accent underline underline-offset-4"
          >
            Explore the circuit
          </TransitionLink>
        </Reveal>
        <div className="relative order-1 h-[320px] overflow-hidden bg-accent md:order-2 md:h-[460px]">
          <ClipReveal direction="right" duration={0.7} className="relative h-full w-full">
            {experienceCarouselImages.length > 0 ? (
              <ExperienceCarousel
                key={experienceCarouselImages.map((image) => image.id).join(",")}
                images={experienceCarouselImages}
              />
            ) : null}
          </ClipReveal>
        </div>
      </section>

      {/* Location — topographic terrain scene as a quiet background
          layer (qualifying desktop visitors only; see location-panel.tsx
          for the mobile/reduced-motion/no-WebGL CSS fallback). Content
          stays z-10 and visually dominant over the terrain either way. */}
      <section className="relative overflow-hidden panel-accent-tint py-16">
        <LocationPanel className="absolute inset-0" />
        <div className="page-shell relative z-10">
          <Reveal variant="fade" duration={0.4}>
            <p className="mb-3 text-xs tracking-[0.2em] text-muted">GETTING HERE</p>
            <h2 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">
              2.5 hours from Colombo via Horana Road
            </h2>
            <TransitionLink href="/contact" label="Contact" className="link-inline mt-4 inline-block">
              Map &amp; directions
            </TransitionLink>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-12 text-text">
        <div className="page-shell">
          <Reveal variant="fade-rise" duration={0.45}>
            <p className="mb-6 text-xs tracking-[0.2em] text-muted">GUEST STORIES</p>
            <GuestStoriesCarousel testimonials={featuredTestimonials} />
          </Reveal>
        </div>
      </section>
    </>
  );
}