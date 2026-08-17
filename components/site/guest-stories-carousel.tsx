"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/lib/types/domain";

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD_PX = 50;

export function GuestStoriesCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [instant, setInstant] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = useCallback(
    (next: number, opts?: { instant?: boolean }) => {
      if (count === 0) return;
      setInstant(Boolean(opts?.instant) || reduceMotionRef.current);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  // Autoplay — pauses on hover/focus/touch and respects reduced-motion.
  useEffect(() => {
    if (count <= 1 || paused || reduceMotionRef.current) return;
    const id = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [index, paused, count, goTo]);

  if (count === 0) {
    return <p className="text-sm text-muted">Guest stories will appear here once approved.</p>;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const endX = e.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined) return;
    const delta = endX - startX;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) goTo(delta > 0 ? index - 1 : index + 1);
    touchStartX.current = null;
  };

  return (
    <div
      className="mx-auto max-w-2xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Guest stories"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden">
        <div
          className={`flex ${instant ? "" : "transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live="polite"
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.id}
              className="w-full shrink-0 px-1 text-center"
              aria-hidden={i !== index}
            >
              <Quote className="mx-auto h-8 w-8 text-accent/60" strokeWidth={1.5} aria-hidden />
              <p className="mx-auto mt-4 max-w-xl text-balance font-[family-name:var(--font-fraunces)] text-2xl leading-snug text-text md:text-3xl">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-5 flex flex-col items-center gap-2">
                {testimonial.photoUrl ? (
                  <span className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
                    <Image
                      src={testimonial.photoUrl}
                      alt={testimonial.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <p className="text-accent text-sm" aria-label="5 out of 5 stars">
                  ★★★★★
                </p>
                <p className="text-sm font-medium text-text/80">
                  {testimonial.name}
                  {testimonial.country ? ` · ${testimonial.country}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous guest story"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to guest story ${i + 1} of ${count}`}
                aria-current={i === index}
                className="p-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-accent" : "w-1.5 bg-primary/20"
                    }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next guest story"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}