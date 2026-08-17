"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

/**
 * Wraps the hero photo only — the wrapping <motion.div> handles the
 * scale/opacity settle via transform, so the underlying next/image
 * keeps `priority` and paints on its normal loading timeline. The
 * animation is a compositor-only transform, not a mount gate, so it
 * does not affect LCP.
 */
export function HeroImageReveal({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0"
      initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 1.045, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : DURATION.cinematic,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}
