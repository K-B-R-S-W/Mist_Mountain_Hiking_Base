import { getVisibleRooms } from "@/lib/repositories";
import { RoomCard } from "@/components/site/room-card";
import { Reveal } from "@/components/site/motion/reveal";
import { Stagger, StaggerItem } from "@/components/site/motion/stagger";

export default async function RoomsPage() {
  const rooms = await getVisibleRooms();

  return (
    <div className="page-shell py-16">
      <Reveal variant="fade" duration={0.4}>
        <p className="eyebrow">STAY</p>
        <h1 className="mt-3 text-3xl md:text-5xl">Rooms and mountain decks</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Choose your preferred deck layout and view line. Every room is integrated with the
          hillside, with direct access to hiking starts and shared common areas.
        </p>
      </Reveal>

      <Stagger className="mt-10 grid gap-5 md:grid-cols-2" stagger={0.07}>
        {rooms.map((room) => (
          <StaggerItem key={room.id} className="h-full">
            <RoomCard
              room={room}
              sizes="(min-width: 768px) 50vw, 100vw"
              headingLevel="h2"
              ctaLabel="View details"
            />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
