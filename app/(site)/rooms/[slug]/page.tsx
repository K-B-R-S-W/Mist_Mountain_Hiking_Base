import { notFound } from "next/navigation";
import Image from "next/image";
import { InquiryForm } from "@/app/(site)/_components/inquiry-form";
import { getRoomBySlug, getVisibleRooms } from "@/lib/repositories";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [room, rooms] = await Promise.all([getRoomBySlug(slug), getVisibleRooms()]);
  if (!room || !room.isVisible) notFound();

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">ROOM</p>
      <h1 className="mt-3 text-3xl md:text-5xl">{room.name}</h1>
      <p className="mt-4 max-w-2xl text-muted">
        {room.description ?? room.shortDescription ?? "A mountain stay designed for rest and trail days."}
      </p>

      {room.images.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {room.images.map((image) => (
            <div
              key={image.mediaId}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card-inner)] bg-black/5"
            >
              <Image
                src={image.url}
                alt={image.alt ?? room.name}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
        <span className="badge">Up to {room.maxGuests} guests</span>
        <span className="badge">From LKR {room.basePrice.toLocaleString()}</span>
      </div>

      {room.amenities.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl">Amenities</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <li key={amenity.id} className="badge">
                {amenity.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-xl">Check availability</h2>
        <p className="mt-2 text-sm text-muted">
          Share your dates and we&apos;ll confirm availability by email.
        </p>
        <div className="mt-4 max-w-3xl">
          <InquiryForm rooms={rooms} selectedRoom={room} />
        </div>
      </section>
    </div>
  );
}

