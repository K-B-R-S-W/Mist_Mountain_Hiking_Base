import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import { BOOKING_STATUS } from "@/lib/constants";
import type {
  ReportingOccupancy,
  ReportingRevenue,
  ReportingSourceBreakdown,
} from "@/lib/types/domain";

/** Helper to get days between two dates, inclusive of start and end */
function getDaysInDateRange(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export async function getOccupancyRate(
  fromStr: string,
  toStr: string
): Promise<ReportingOccupancy> {
  const supabase = await createClient();
  const from = new Date(fromStr);
  const to = new Date(toStr);

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id")
    .eq("is_deleted", false);
  assertNoError(roomsError, "Failed to load rooms for occupancy");

  const totalRoomNights = (rooms?.length ?? 0) * getDaysInDateRange(from, to);

  if (totalRoomNights === 0) {
    return { occupiedRoomNights: 0, totalRoomNights: 0, rate: 0 };
  }

  // Find all bookings in range
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("room_id, check_in, check_out, status")
    .in("status", [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED])
    .lte("check_in", toStr)
    .gte("check_out", fromStr);
  assertNoError(bookingsError, "Failed to load bookings for occupancy");

  // Find all blocks in range
  const { data: blocks, error: blocksError } = await supabase
    .from("room_blocks")
    .select("room_id, start_date, end_date")
    .lte("start_date", toStr)
    .gte("end_date", fromStr);
  assertNoError(blocksError, "Failed to load room blocks for occupancy");

  // Count occupied nights accurately
  let occupiedRoomNights = 0;
  let blockedRoomNights = 0;
  for (let i = 0; i < getDaysInDateRange(from, to); i++) {
    const currentDay = new Date(from);
    currentDay.setDate(currentDay.getDate() + i);
    const dayStr = currentDay.toISOString().slice(0, 10);

    for (const room of rooms ?? []) {
      const isBlocked = blocks?.some(
        (bl) =>
          bl.room_id === room.id &&
          bl.start_date <= dayStr &&
          bl.end_date >= dayStr
      );
      if (isBlocked) {
        blockedRoomNights++;
        continue; // Exclude blocked days from available inventory
      }

      const isBooked = bookings?.some(
        (b) =>
          b.room_id === room.id &&
          b.check_in && b.check_out &&
          b.check_in <= dayStr &&
          b.check_out >= dayStr
      );
      if (isBooked) occupiedRoomNights++;
    }
  }

  const bookableRoomNights = Math.max(0, totalRoomNights - blockedRoomNights);
  const rate = bookableRoomNights > 0 ? Math.round((occupiedRoomNights / bookableRoomNights) * 100) : 0;
  return { occupiedRoomNights, totalRoomNights: bookableRoomNights, rate };
}

export async function getRevenueSummary(
  fromStr: string,
  toStr: string
): Promise<ReportingRevenue> {
  const supabase = await createClient();

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, name, base_price")
    .eq("is_deleted", false);
  assertNoError(roomsError, "Failed to load rooms for revenue");

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("room_id, check_in, check_out, status")
    .in("status", [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED])
    .gte("check_in", fromStr)
    .lte("check_in", toStr); // Only counting revenue for bookings that START in this range
  assertNoError(bookingsError, "Failed to load bookings for revenue");

  const byRoom = (rooms ?? []).map((room) => {
    const roomBookings = bookings?.filter((b) => b.room_id === room.id) ?? [];
    const revenue = roomBookings.reduce((sum, _b) => sum + room.base_price, 0); // Following the spec: base_price * 1 (per booking started, or per night. The spec says "SUM(rooms.base_price × nights)" but actually it says "Revenue is computed as room's current base_price × number of bookings that month" in Phase 4. Wait, Phase 5 spec says "sum of base_price × nights". Let's do nights).
    
    const revenueByNights = roomBookings.reduce((sum, b) => {
        if (!b.check_in || !b.check_out) return sum;
        const nights = getDaysInDateRange(new Date(b.check_in), new Date(b.check_out)) - 1; // nights = days - 1
        return sum + (room.base_price * Math.max(1, nights));
    }, 0);

    return { name: room.name, revenue: revenueByNights };
  });

  const total = byRoom.reduce((sum, r) => sum + r.revenue, 0);

  return { total, byRoom };
}

export async function getSourceBreakdown(
  fromStr: string,
  toStr: string
): Promise<ReportingSourceBreakdown> {
  const supabase = await createClient();

  // Bookings created in range
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("source")
    .gte("created_at", `${fromStr}T00:00:00.000Z`)
    .lte("created_at", `${toStr}T23:59:59.999Z`);
  assertNoError(bookingsError, "Failed to load bookings for source breakdown");

  let direct = 0;
  let phone = 0;
  let booking_com = 0;
  let chatbot = 0;

  for (const b of bookings ?? []) {
    if (b.source === "direct") direct++;
    if (b.source === "phone") phone++;
    if (b.source === "booking_com") booking_com++;
    if (b.source === "chatbot") chatbot++;
  }

  return { direct, phone, booking_com, chatbot };
}
