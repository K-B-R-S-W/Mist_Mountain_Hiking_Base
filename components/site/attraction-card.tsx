import Image from "next/image";
import type { GalleryImage } from "@/lib/types/domain";

/**
 * Circuit-card for /experiences — mirrors RoomCard's proportions and hover
 * treatment (image scale on hover, concentric radius, card shadow) so the
 * site reads as one system rather than two different card languages.
 * Server Component: hover is a plain CSS transition, no client JS needed.
 */
export function AttractionCard({ image, sizes }: { image: GalleryImage; sizes: string }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
        <Image
          src={image.url}
          alt={image.alt ?? image.title ?? ""}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {image.title ? <h3 className="text-lg">{image.title}</h3> : null}
        {image.description ? (
          <p className="mt-2 text-sm text-muted line-clamp-3">{image.description}</p>
        ) : null}
      </div>
    </article>
  );
}
