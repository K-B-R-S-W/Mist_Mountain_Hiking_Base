import { TransitionLink } from "@/components/site/motion/transition-link";
import { getSiteSettings } from "@/lib/repositories";
import { GoogleMap } from "@/components/site/google-map";
import { QuickLinks } from "@/components/site/quick-links";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="page-shell py-16">
      <p className="eyebrow">CONTACT</p>
      <h1 className="mt-3 text-3xl md:text-5xl">Plan your mountain stay</h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl">Direct contact</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Phone</dt>
              <dd>{settings.phone ?? "Available on request"}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>{settings.email ?? "Available on request"}</dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd>{settings.address ?? "Pimbura, Rathnapura"}</dd>
            </div>
          </dl>
          <QuickLinks
            settings={settings}
            className="mt-5 flex gap-2 text-primary"
          />
        </article>

        <article className="rounded-[var(--radius-card)] bg-secondary p-6 text-background">
          <h2 className="text-xl">Booking inquiries</h2>
          <p className="mt-3 text-background/80">
            Share dates, group size, and route interests. Our team responds with availability and
            guidance on room fit and activity timing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <TransitionLink href="/book" label="Book" className="btn-primary">
              Go to booking form
            </TransitionLink>
            {settings.bookingUrl ? (
              <a
                href={settings.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-background/30 px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-background/10"
              >
                Check on Booking.com
              </a>
            ) : null}
          </div>
        </article>
      </div>

      <div className="mt-5">
        <GoogleMap googleMapsUrl={settings.googleMapsUrl} address={settings.address} title={settings.hotelName} />
      </div>
    </div>
  );
}

