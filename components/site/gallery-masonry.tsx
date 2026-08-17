"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";
import type { GalleryImage } from "@/lib/types/domain";

/**
 * Pure-CSS masonry via multi-column layout — no JS measuring, no stored
 * image dimensions required. Each tile keeps its natural aspect ratio and
 * `break-inside-avoid` stops it splitting across columns. New images just
 * append into `gallery_images` (sort_order) and flow into the next open
 * slot on next render — no reflow logic to maintain.
 */
export function GalleryMasonry({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const image of images) {
      if (image.category) set.add(image.category);
    }
    return Array.from(set).sort();
  }, [images]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const filtered = useMemo(
    () => (activeCategory === "all" ? images : images.filter((image) => image.category === activeCategory)),
    [images, activeCategory]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length]
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length]
  );

  useEffect(() => setLightboxIndex(null), [activeCategory]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  if (images.length === 0) {
    return <p className="mt-10 text-muted">No photos yet — check back soon.</p>;
  }

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="mt-10">
      {categories.length > 1 ? (
        <div role="tablist" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
          <FilterTab label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {categories.map((category) => (
            <FilterTab
              key={category}
              label={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-6 columns-2 gap-4 sm:columns-3 lg:columns-4 [column-fill:_balance]">
        {filtered.map((image, index) => {
          // Stagger only what's likely visible at once; cap the group so
          // fast-scrolling doesn't queue a long, laggy delay sequence for
          // tiles further down the grid.
          const staggerDelay = prefersReducedMotion ? 0 : (index % 12) * 0.03;
          return (
            <motion.button
              key={image.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`Open image${image.title ? `: ${image.title}` : ""}`}
              className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-card-inner)] bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.4,
                delay: staggerDelay,
                ease: EASE_OUT,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- natural aspect ratio is required for masonry; dimensions aren't stored per image */}
              <img
                src={image.url}
                alt={image.alt ?? image.title ?? ""}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full transition duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </motion.button>
          );
        })}
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title ?? "Gallery image"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>

          {filtered.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:left-4"
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-4"
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </>
          ) : null}

          <figure className="max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- full-size preview, dimensions unknown ahead of load */}
            <img
              src={active.url}
              alt={active.alt ?? active.title ?? ""}
              className="max-h-[80vh] max-w-[90vw] rounded-[var(--radius-card-inner)] object-contain"
            />
            {active.title ? (
              <figcaption className="mt-3 text-center text-sm text-white/80">{active.title}</figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-4 py-1.5 text-xs font-medium capitalize text-background transition"
          : "rounded-full border border-black/10 bg-surface px-4 py-1.5 text-xs font-medium capitalize text-muted transition hover:border-black/20 hover:text-text"
      }
    >
      {label}
    </button>
  );
}
