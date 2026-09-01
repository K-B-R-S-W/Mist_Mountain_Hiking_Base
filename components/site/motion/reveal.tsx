"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";

/**
 * Content-appropriate reveal variants — deliberately not a single
 * "fade up everywhere" recipe. Pick the one that matches what the
 * section is showing:
 *  - fade        quiet content (data strips, secondary copy)
 *  - fade-rise   default editorial reveal (headings, cards)
 *  - clip-left   image wipes in from the left edge
 *  - clip-right  image wipes in from the right edge (mirrored layouts)
 */
export type RevealVariant = "fade" | "fade-rise" | "clip-left" | "clip-right";

const variantMap: Record<RevealVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "fade-rise": {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  "clip-left": {
    hidden: { clipPath: "inset(0% 0% 0% 100%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)" },
  },
  "clip-right": {
    hidden: { clipPath: "inset(0% 100% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)" },
  },
};

export function Reveal({
  children,
  variant = "fade-rise",
  duration = 0.55,
  delay = 0,
  amount = 0.25,
  once = true,
  className,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  duration?: number;
  delay?: number;
  /** Fraction of the element that must be visible before it triggers. */
  amount?: number;
  /** Replay every time it re-enters the viewport instead of once. */
  once?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  // Under reduced motion, always fall back to opacity-only — never skip
  // the reveal entirely, since an abrupt pop-in reads as more jarring
  // than a quick fade.
  const resolvedVariant = prefersReducedMotion ? variantMap.fade : variantMap[variant];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={resolvedVariant}
      transition={{
        duration: prefersReducedMotion ? 0.2 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
