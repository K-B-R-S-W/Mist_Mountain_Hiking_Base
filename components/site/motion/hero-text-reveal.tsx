"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";

/**
 * The hero's one-time text choreography: eyebrow -> title -> subtitle,
 * each arriving slightly after the last. Runs on mount only (not
 * scroll-triggered) since the hero is always the first thing visible.
 * Deliberately not built on <Reveal>/<Stagger> — this sequence is
 * specific enough to the hero that generalizing it would just add
 * indirection (per the design system's "page-specific" primitives list).
 */
export function HeroTextReveal({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  const item: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="relative max-w-xl">
      <motion.p
        variants={item}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: EASE_OUT }}
        className="mb-4 text-xs tracking-[0.2em] text-background/70"
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        variants={item}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.55, ease: EASE_OUT }}
        className="font-[family-name:var(--font-fraunces)] text-4xl font-medium leading-tight md:text-6xl"
      >
        {title}
      </motion.h1>
      <motion.p
        variants={item}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: EASE_OUT }}
        className="mt-4 max-w-md text-background/80"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
