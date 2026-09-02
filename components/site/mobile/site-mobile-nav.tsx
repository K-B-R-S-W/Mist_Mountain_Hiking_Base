"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";
import { TransitionLink } from "@/components/site/motion/transition-link";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type NavItem = { href: string; label: string };

export function SiteMobileNav({
  items,
  bookingUrl,
  airbnbUrl,
  hotelName,
  logoUrl,
  logoAlt,
}: {
  items: NavItem[];
  bookingUrl?: string | null;
  airbnbUrl?: string | null;
  hotelName: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Move focus into the dialog on open, return it to the trigger on close —
  // a keyboard/screen-reader user should never be left with focus stranded
  // on the (now-covered) hamburger button while the drawer is open.
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      const trigger = triggerRef.current;
      return () => {
        trigger?.focus();
      };
    }
  }, [open]);

  // Escape closes; Tab/Shift+Tab is trapped inside the panel so focus can't
  // silently leave the dialog into content behind the backdrop.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const drawer = (
    // Always mounted (even when closed) so `aria-controls="site-mobile-nav-drawer"`
    // on the trigger button below resolves to a real DOM node at all times —
    // only the visible/animated content inside is conditionally rendered.
    <div
      id="site-mobile-nav-drawer"
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label="Site menu"
    >
      <AnimatePresence>
        {open ? (
          <div key="drawer-content" className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : DURATION.fast, ease: EASE_OUT }}
            />

            {/* Drawer — position:fixed is anchored to the viewport only because
                this whole subtree is portaled to document.body. Rendering it in
                place (as a descendant of the backdrop-blur header) would make
                the browser treat that header as fixed's containing block,
                clipping the panel to the header's own height. Slides in from
                the right edge it's anchored to (`right-0` below).
                260ms open / 180ms close — deliberately not DURATION.slow
                (420ms, the generic modal/drawer ceiling): this drawer's own
                spec calls for 220-280ms open and a faster ~180ms close per
                the enter/exit asymmetry rule, so it's given explicit timing
                here rather than inheriting the shared token. */}
            <motion.div
              ref={panelRef}
              className="pt-safe pb-safe absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col bg-background px-6 py-5 shadow-xl"
              initial={{ x: prefersReducedMotion ? 0 : "100%" }}
              animate={{
                x: 0,
                transition: { duration: prefersReducedMotion ? 0.01 : 0.26, ease: EASE_OUT },
              }}
              exit={{
                x: prefersReducedMotion ? 0 : "100%",
                transition: { duration: prefersReducedMotion ? 0.01 : 0.18, ease: EASE_OUT },
              }}
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
                  ref={closeButtonRef}
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
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    className="rounded-md px-2 py-3 text-text transition-colors active:bg-black/5"
                  >
                    {item.label}
                  </TransitionLink>
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
                {airbnbUrl ? (
                  <a
                    href={airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-[#FF385C] px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Airbnb
                  </a>
                ) : null}
                <TransitionLink
                  href="/book"
                  label="Book"
                  className="rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-background"
                >
                  Check availability
                </TransitionLink>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
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
