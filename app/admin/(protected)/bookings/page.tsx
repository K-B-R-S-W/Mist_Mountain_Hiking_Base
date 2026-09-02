import { getAdminBookings } from "@/lib/repositories";
import { BookingsManager } from "@/components/admin/bookings/bookings-manager";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-primary font-semibold">
          Booking Inquiries
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review, filter, and track incoming guest inquiries across website, phone, and OTA sync.
        </p>
      </div>

      <BookingsManager initialBookings={bookings} />
    </div>
  );
}
