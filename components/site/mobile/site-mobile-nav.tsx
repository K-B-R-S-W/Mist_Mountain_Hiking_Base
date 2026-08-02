"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavItem = { href: string; label: string };

export function SiteMobileNav({
  items,
  bookingUrl,
  hotelName,
  logoUrl,
  logoAlt,
}: {
  items: NavItem[];
  bookingUrl?: string | null;
  hotelName: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal target isn't available during SSR; only render it client-side
  // after mount to avoid a hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change so the drawer never lingers over a new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape key closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const drawer = open ? (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />

      {/* Drawer — position:fixed is anchored to the viewport only because
          this whole subtree is portaled to document.body. Rendering it in
          place (as a descendant of the backdrop-blur header) would make
          the browser treat that header as fixed's containing block,
          clipping the panel to the header's own height. */}
      <div
        id="site-mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="pt-safe pb-safe absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col bg-background px-6 py-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 font-[family-name:var(--font-fraunces)] text-lg font-medium text-primary">
            {logoUrl ? (
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                <Image src={logoUrl} alt={logoAlt ?? hotelName} fill sizes="36px" className="object-contain" />
              </span>
            ) : null}
            {hotelName}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary active:scale-95"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 text-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-3 text-text transition-colors active:bg-black/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-black/8 pt-5">
          {bookingUrl ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-[#003580] px-4 py-3 text-center text-sm font-medium text-white"
            >
              Booking.com
            </a>
          ) : null}
          <Link
            href="/book"
            className="rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-background"
          >
            Check availability
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-mobile-nav-drawer"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary active:scale-95"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
