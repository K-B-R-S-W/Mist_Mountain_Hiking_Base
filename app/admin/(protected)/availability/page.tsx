import { createClient } from "@/lib/supabase/server";
import { getAdminRooms } from "@/lib/repositories";
import { AvailabilityManager } from "@/components/admin/availability/availability-manager";

export default async function AdminAvailabilityPage() {
  const supabase = await createClient();

  const [rooms, blocksRes] = await Promise.all([
    getAdminRooms(),
    supabase
      .from("room_blocks")
      .select("id, room_id, start_date, end_date, reason, source, created_at, rooms(name)")
      .order("start_date", { ascending: true }),
  ]);

  const rawBlocks = blocksRes.data ?? [];
  const initialBlocks = rawBlocks.map((b) => {
    const roomName = Array.isArray(b.rooms)
      ? b.rooms[0]?.name
      : (b.rooms as { name: string } | null)?.name;

    return {
      id: b.id,
      roomId: b.room_id,
      roomName: roomName || "Unknown Room",
      startDate: b.start_date,
      endDate: b.end_date,
      reason: b.reason,
      source: b.source as "manual" | "booking",
      createdAt: b.created_at,
    };
  });

  const roomOptions = rooms.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Room Availability
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage blackout dates, property maintenance periods, and owner reserve blocks.
        </p>
      </div>

      <AvailabilityManager rooms={roomOptions} initialBlocks={initialBlocks} />
    </div>
  );
}
