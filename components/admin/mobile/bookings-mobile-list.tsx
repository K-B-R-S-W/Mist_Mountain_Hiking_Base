import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from "@/lib/constants";
import { updateBookingStatus } from "@/lib/actions/update-booking-status";
import type { BookingInquiry } from "@/lib/types/domain";

const STATUS_OPTIONS = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONTACTED,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
] as const;

export function BookingsMobileList({ bookings }: { bookings: BookingInquiry[] }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {bookings.map((booking) => (
        <div key={booking.id} className="card">
          <div className="flex items-center justify-between">
            <p className="font-medium">{booking.guestName}</p>
            {booking.source === "chatbot" ? (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                Chatbot
              </span>
            ) : booking.source === "booking_com" ? (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                Booking.com
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted">{booking.email}</p>
          {booking.phone ? <p className="text-xs text-muted">{booking.phone}</p> : null}

          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
            <dt className="text-text/60">Room</dt>
            <dd className="text-text">{booking.roomName ?? "Any"}</dd>
            <dt className="text-text/60">Dates</dt>
            <dd className="text-text">
              {booking.checkIn ?? "-"} to {booking.checkOut ?? "-"}
            </dd>
            <dt className="text-text/60">Guests</dt>
            <dd className="text-text">{booking.guests ?? "-"}</dd>
          </dl>

          {booking.message ? (
            <p className="mt-3 border-t border-black/8 pt-3 text-sm text-muted">{booking.message}</p>
          ) : null}

          <form
            action={async (formData) => {
              "use server";
              await updateBookingStatus({
                id: booking.id,
                status: formData.get("status"),
              });
            }}
            className="mt-3 flex items-center gap-2 border-t border-black/8 pt-3"
          >
            <select name="status" defaultValue={booking.status} className="form-input py-2 text-sm">
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary px-3 py-2 text-xs">
              Save
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
