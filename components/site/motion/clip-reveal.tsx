"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";

/**
 * Image wipe-in reveal, used where `Reveal`'s clip-left/clip-right variants
 * were silently never firing: this component intentionally separates the
 * OBSERVED element from the CLIPPED element.
 *
 * Root cause of the original bug — `Reveal` applied `whileInView` directly
 * to the same motion.div that started at `clip-path: inset(0% 0% 0% 100%)`
 * (a zero-painted-area clip) on mount. An element with zero rendered area
 * can be skipped by both the browser's native `loading="lazy"` heuristic
 * and, in some engines, IntersectionObserver callbacks — so the reveal
 * never triggered and the underlying <img> never even requested. Observing
 * a plain, always-full-size wrapper and applying the clip-path to a nested
 * child instead avoids that self-referential trap entirely.
 */
export function ClipReveal({
  children,
  direction,
  duration = 0.7,
  className,
}: {
  children: React.ReactNode;
  direction: "left" | "right";
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();

  const hiddenClip = direction === "left" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
  const visibleClip = "inset(0% 0% 0% 0%)";

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full"
        initial={{ clipPath: prefersReducedMotion ? visibleClip : hiddenClip }}
        animate={{ clipPath: isInView ? visibleClip : undefined }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : duration,
          ease: EASE_OUT,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
