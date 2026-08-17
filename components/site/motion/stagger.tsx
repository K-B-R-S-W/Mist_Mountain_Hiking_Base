"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";

/**
 * Wrap a list/grid of items in <Stagger>, wrap each item in
 * <StaggerItem>. Only use this for genuine lists of distinct choices
 * (stat strips, room cards) — not for paragraphs or single compositions,
 * which should use <Reveal> instead.
 */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  amount = 0.2,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  once?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : stagger },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  rise = 10,
  duration = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  rise?: number;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : duration, ease: EASE_OUT },
    },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
