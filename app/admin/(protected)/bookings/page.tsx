import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/constants";
import { updateBookingStatus } from "@/lib/actions/update-booking-status";
import { getAdminBookings } from "@/lib/repositories";
import { BookingsMobileList } from "@/components/admin/mobile/bookings-mobile-list";

const STATUS_OPTIONS = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONTACTED,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
] as const;

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Bookings</h1>
      <p className="mt-2 text-sm text-muted">Review and update incoming inquiries.</p>
      <div className="mt-6">
        <BookingsMobileList bookings={bookings} />
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[840px] border-separate border-spacing-y-2 text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="bg-surface">
                <td className="rounded-l-md px-3 py-3 align-top">
                  <p className="font-medium">{booking.guestName}</p>
                  <p className="text-xs text-muted">{booking.email}</p>
                  {booking.phone ? <p className="text-xs text-muted">{booking.phone}</p> : null}
                </td>
                <td className="px-3 py-3 align-top">{booking.roomName ?? "Any"}</td>
                <td className="px-3 py-3 align-top">
                  {booking.checkIn ?? "-"} to {booking.checkOut ?? "-"}
                </td>
                <td className="px-3 py-3 align-top">{booking.guests ?? "-"}</td>
                <td className="px-3 py-3 align-top">
                  <form
                    action={async (formData) => {
                      "use server";
                      await updateBookingStatus({
                        id: booking.id,
                        status: formData.get("status"),
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <select name="status" defaultValue={booking.status} className="form-input py-1">
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {BOOKING_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-primary px-3 py-1 text-xs">
                      Save
                    </button>
                  </form>
                </td>
                <td className="rounded-r-md px-3 py-3 align-top text-muted">
                  {booking.message ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

