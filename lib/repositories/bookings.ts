import "server-only";
import { createClient } from "@/lib/supabase/server";
import { assertNoError } from "@/lib/repositories/_shared";
import type { BookingInquiry } from "@/lib/types/domain";

export async function getAdminBookings(): Promise<BookingInquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, room_id, guest_name, email, phone, check_in, check_out, guests, message, status, created_at, source, booking_ref, rooms(name)")
    .order("created_at", { ascending: false });

  assertNoError(error, "Failed to load bookings");
  const rows = (data ?? []) as Array<{
    id: string;
    room_id: string | null;
    guest_name: string;
    email: string;
    phone: string | null;
    check_in: string | null;
    check_out: string | null;
    guests: number | null;
    message: string | null;
    status: BookingInquiry["status"];
    created_at: string;
    source?: BookingInquiry["source"];
    booking_ref?: string | null;
    rooms: { name: string } | { name: string }[] | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    roomId: row.room_id,
    roomName: Array.isArray(row.rooms) ? (row.rooms[0]?.name ?? null) : (row.rooms?.name ?? null),
    guestName: row.guest_name,
    email: row.email,
    phone: row.phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    source: row.source ?? null,
    bookingRef: row.booking_ref ?? null,
  }));
}
