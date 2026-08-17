import Image from "next/image";
import type { RoomSummary } from "@/lib/types/domain";
import { TransitionLink } from "@/components/site/motion/transition-link";

/**
 * Server Component on purpose — hover (image scale) and press (link
 * scale) feedback are both plain CSS transitions/pseudo-classes, so no
 * client-side JS is needed here beyond the CTA link itself. Used by both
 * the homepage teaser grid and /rooms so the two surfaces can't drift out
 * of sync.
 *
 * The CTA renders TransitionLink (a client leaf) with label={room.name} so
 * the page-curtain shows the room's real name rather than a generic
 * "Rooms" label — see spec-page-curtain-transitions.md FR-004.
 *
 * Press feedback lives on the CTA link, not the outer <article> — the
 * card itself has no click handler, and iOS Safari only triggers
 * :active on natively-interactive elements (links, buttons, form
 * controls) or elements with an explicit onClick. Putting it on a
 * bare <article> would silently do nothing on iPhone.
 */
export function RoomCard({
  room,
  sizes,
  headingLevel: Heading = "h3",
  ctaLabel = "View room",
}: {
  room: RoomSummary;
  /** Pass the `sizes` value appropriate to the grid this card sits in. */
  sizes: string;
  /** h2 on /rooms (page title is h1); h3 on the homepage (section title is h2). */
  headingLevel?: "h2" | "h3";
  /** Preserves each page's original CTA copy ("View room" vs "View details"). */
  ctaLabel?: string;
}) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
        {room.primaryImageUrl ? (
          <Image
            src={room.primaryImageUrl}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}
      </div>
      {/* flex-1 + flex-col here, footer pinned via mt-auto below, is what
          keeps every card the same height regardless of title/description
          length — the grid row no longer dictates card height, the card
          itself does, uniformly. */}
      <div className="flex flex-1 flex-col p-5">
        <Heading className="line-clamp-2 text-lg">{room.name}</Heading>
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {room.shortDescription ?? "Quiet mountain-facing deck stay."}
        </p>
        <div className="mt-auto pt-3">
          <p className="text-sm">
            Up to {room.maxGuests} guests · from LKR {room.basePrice.toLocaleString()}
          </p>
          <TransitionLink
            href={`/rooms/${room.slug}`}
            label={room.name}
            className="link-inline mt-4 inline-block transition-transform duration-150 ease-out active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {ctaLabel}
          </TransitionLink>
        </div>
      </div>
    </article>
  );
}
