import Image from "next/image";
import Link from "next/link";
import { getVisibleRooms } from "@/lib/repositories";

export default async function RoomsPage() {
  const rooms = await getVisibleRooms();

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">STAY</p>
      <h1 className="mt-3 text-3xl md:text-5xl">Rooms and mountain decks</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Choose your preferred deck layout and view line. Every room is integrated with the
        hillside, with direct access to hiking starts and shared common areas.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {rooms.map((room) => (
          <article key={room.id} className="card overflow-hidden p-0">
            <div className="relative aspect-[4/3] bg-black/5">
              {room.primaryImageUrl ? (
                <Image
                  src={room.primaryImageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="p-5">
              <h2 className="text-xl">{room.name}</h2>
              <p className="mt-2 text-sm text-muted">
                {room.shortDescription ?? "Quiet mountain-facing stay with essential comforts."}
              </p>
              <p className="mt-3 text-sm">
                Up to {room.maxGuests} guests · from LKR {room.basePrice.toLocaleString()}
              </p>
              <Link href={`/rooms/${room.slug}`} className="link-inline mt-5 inline-block">
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
