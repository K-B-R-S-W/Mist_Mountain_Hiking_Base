"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavItem = { href: string; label: string };

export function AdminMobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

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
      <button
        type="button"
        aria-label="Close admin menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />

      {/* Portaled to document.body so position:fixed always anchors to the
          viewport, regardless of any filter/transform/backdrop-blur an
          ancestor (e.g. the topbar) might gain later. */}
      <div
        id="admin-mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className="pt-safe pb-safe absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col bg-surface px-6 py-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-fraunces)] text-primary">
            Mist Mountain
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary active:scale-95"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1 text-base">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-3 text-text/80 transition-colors active:bg-black/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls="admin-mobile-nav-drawer"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary active:scale-95"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
