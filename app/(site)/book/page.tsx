import { InquiryForm } from "@/app/(site)/_components/inquiry-form";
import { getSiteSettings, getVisibleRooms } from "@/lib/repositories";

export default async function BookPage() {
  const [rooms, settings] = await Promise.all([getVisibleRooms(), getSiteSettings()]);

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">BOOK</p>
      <h1 className="mt-3 text-3xl md:text-5xl">Check availability</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Send your preferred dates and group details. We&apos;ll reply with room availability and
        practical recommendations for your route plan.
      </p>

      {settings.bookingUrl || settings.airbnbUrl ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-black/10 bg-surface p-4">
          {settings.bookingUrl ? (
            <a
              href={settings.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Check on Booking.com
            </a>
          ) : null}
          {settings.airbnbUrl ? (
            <a
              href={settings.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-[#FF385C] border-[#FF385C]/30 hover:bg-[#FF385C]/5"
            >
              Check on Airbnb
            </a>
          ) : null}
          <span className="text-xs text-muted">
            Prefer to book instantly through our verified OTA listings instead? Use these links — or send us
            your dates directly below and we&apos;ll confirm by phone or email.
          </span>
        </div>
      ) : null}

      <div className="mt-8 max-w-3xl">
        <InquiryForm rooms={rooms} />
      </div>
    </div>
  );
}