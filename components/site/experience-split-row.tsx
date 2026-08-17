import Image from "next/image";
import type { GalleryImage } from "@/lib/types/domain";
import { Reveal } from "@/components/site/motion/reveal";
import { ClipReveal } from "@/components/site/motion/clip-reveal";

/**
 * Editorial image+story row — same split pattern as the homepage's "Mist
 * Experience" and "Experiences" sections (spec.md §9: full-bleed split
 * layouts over stacked cards). `reverse` flips which side the image sits
 * on and which edge the ClipReveal wipes in from, so a list of these
 * naturally alternates left/right without each call site repeating the
 * mirroring logic.
 */
export function ExperienceSplitRow({
  image,
  eyebrow,
  reverse = false,
}: {
  image: GalleryImage;
  eyebrow: string;
  reverse?: boolean;
}) {
  return (
    <section className="grid md:grid-cols-2">
      <div
        className={`relative min-h-[280px] overflow-hidden bg-secondary md:min-h-[420px] ${
          reverse ? "order-1 md:order-2" : "order-1"
        }`}
      >
        <ClipReveal direction={reverse ? "right" : "left"} duration={0.7} className="relative h-full w-full">
          <Image
            src={image.url}
            alt={image.alt ?? image.title ?? ""}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </ClipReveal>
      </div>
      <Reveal
        variant="fade-rise"
        delay={0.35}
        className={`flex flex-col justify-center px-6 py-12 md:min-h-[420px] md:px-16 md:py-0 ${
          reverse ? "order-2 md:order-1" : "order-2"
        }`}
      >
        <p className="mb-3 text-xs tracking-[0.2em] text-muted">{eyebrow}</p>
        {image.title ? (
          <h3 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl">{image.title}</h3>
        ) : null}
        {image.description ? (
          <p className="mt-4 max-w-md leading-relaxed text-text/80">{image.description}</p>
        ) : null}
      </Reveal>
    </section>
  );
}
