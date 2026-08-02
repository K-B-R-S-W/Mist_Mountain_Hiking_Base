import Link from "next/link";
import Image from "next/image";
import { getSiteBranding, getSiteSettings } from "@/lib/repositories";
import { QuickLinks } from "@/components/site/quick-links";
import { SiteMobileNav } from "@/components/site/mobile/site-mobile-nav";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/rooms", label: "Rooms" },
  { href: "/experiences", label: "Experiences" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, branding] = await Promise.all([getSiteSettings(), getSiteBranding()]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-background/90 px-6 py-4 backdrop-blur md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-[family-name:var(--font-fraunces)] text-lg font-medium text-primary"
        >
          {branding.logoUrl ? (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
              <Image
                src={branding.logoUrl}
                alt={branding.logoAlt ?? settings.hotelName}
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </span>
          ) : null}
          {settings.hotelName}
        </Link>

        <nav className="hidden gap-8 text-sm text-text md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Persistent booking CTA — desktop top-right per spec.md §9 */}
        <div className="hidden items-center gap-3 md:flex">
          {settings.bookingUrl ? (
            <a
              href={settings.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[#003580] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00265c]"
            >
              Booking.com
            </a>
          ) : null}
          <Link
            href="/book"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.97]"
          >
            Check availability
          </Link>
        </div>

        {/* Mobile: hamburger opens the full nav + booking links in a drawer. See components/site/mobile/. */}
        <SiteMobileNav
          items={NAV}
          bookingUrl={settings.bookingUrl}
          hotelName={settings.hotelName}
          logoUrl={branding.logoUrl}
          logoAlt={branding.logoAlt}
        />
      </header>

      {/* pb-24 clears the fixed mobile booking bar so footer content is never hidden behind it. */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <footer className="bg-primary text-background">
        <div className="h-1.5 bg-accent" aria-hidden />
        <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-fraunces)] text-lg">{settings.hotelName}</p>
            <p className="mt-2 max-w-sm text-sm text-background/70">
              {settings.address ?? "Udahawaththa Bungalow, Pimbura, Karavita Road, Pimbura 70470"}
            </p>
            <QuickLinks settings={settings} className="mt-5 flex gap-2 text-background" />
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-background/50">EXPLORE</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-background/80 transition-colors hover:text-background">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-background/50">REACH US</p>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              {settings.phone ? <li>{settings.phone}</li> : null}
              {settings.email ? <li>{settings.email}</li> : null}
              {settings.bookingUrl ? (
                <li>
                  <a
                    href={settings.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-background"
                  >
                    Booking.com
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10">
          <p className="page-shell py-5 text-xs text-background/50">
            {settings.copyright ?? `© ${new Date().getFullYear()} ${settings.hotelName}`}
          </p>
        </div>
      </footer>

      {/* Persistent booking CTA — sticky bottom bar on mobile */}
      <Link
        href="/book"
        className="fixed inset-x-4 z-40 rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-background shadow-lg md:hidden"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        Check availability
      </Link>
    </div>
  );
}