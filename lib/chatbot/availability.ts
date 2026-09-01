import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityCheckResult = {
  isAvailable: boolean;
  conflictReason?: string;
  suggestedRooms?: Array<{ id: string; name: string; maxGuests: number; basePrice: number }>;
};

export async function checkRoomAvailability(options: {
  roomId: string;
  checkIn: string;
  checkOut: string;
}): Promise<AvailabilityCheckResult> {
  const { roomId, checkIn, checkOut } = options;
  if (!roomId || !checkIn || !checkOut) {
    return { isAvailable: true };
  }

  const supabase = await createClient();

  const { data: blocks } = await supabase
    .from("room_blocks")
    .select("id, start_date, end_date, reason")
    .eq("room_id", roomId)
    .lte("start_date", checkOut)
    .gte("end_date", checkIn);

  if (blocks && blocks.length > 0) {
    return {
      isAvailable: false,
      conflictReason: "Room is maintenance blocked or reserved for selected dates.",
    };
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, status")
    .eq("room_id", roomId)
    .in("status", ["pending", "contacted", "confirmed"])
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (bookings && bookings.length > 0) {
    return {
      isAvailable: false,
      conflictReason: "Room is already booked for these dates.",
    };
  }

  return { isAvailable: true };
}
