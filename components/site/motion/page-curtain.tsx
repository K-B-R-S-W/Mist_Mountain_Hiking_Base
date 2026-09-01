"use client";

/**
 * Full-screen page-curtain overlay. Presentational only — all navigation
 * logic lives in lib/motion/curtain-context.tsx; this component just plays
 * the sweep and reports completion back so the state machine can advance.
 *
 * Portaled to document.body, mirroring the pattern already established by
 * components/site/mobile/site-mobile-nav.tsx: position:fixed inside the
 * layout's backdrop-blur <header> would treat that header as the fixed
 * element's containing block and clip the overlay to the header's height,
 * so it has to live outside that subtree entirely.
 *
 * Visual approach: `clip-path: polygon(...)` with coordinates expressed as
 * PERCENTAGES OF THE ELEMENT'S OWN BOX (which is `inset-0`, i.e. exactly
 * the viewport). A single scalar `edgeX` drives a fixed-width parallelogram
 * left→right across the box; the diagonal comes from offsetting the top
 * points relative to the bottom points, still in percent.
 *
 * This replaces an earlier `left: -Nvw` + `width: Nvw` + `skewX()` +
 * `translateX(±Nvw)` approach. That version mixed a `vw`-based off-screen
 * travel distance with a `skewX` shear (which shifts points based on the
 * element's own height in *pixels*, not vw). On typical viewport aspect
 * ratios the resulting shear pushed the panel's trailing edge back into
 * the 0–100vw visible window even at the nominal "idle" position — a
 * wedge of the curtain stayed permanently visible at rest. Percentage-based
 * clip-path avoids this class of bug entirely: every coordinate is relative
 * to the box itself, so there's no unit mismatch and no aspect-ratio-
 * dependent leak, regardless of screen size. Same technique already used by
 * `ClipReveal` elsewhere in this codebase — this makes the two consistent.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion/tokens";
import { useCurtain, type CurtainPhase } from "@/lib/motion/curtain-context";

// Sweep duration for the full-motion (non-reduced) experience.
const SWEEP_DURATION = 0.55;
// Reduced-motion: near-instant cross-fade, not a sweep.
const REDUCED_DURATION = 0.12;

// Panel geometry, all in percent of the overlay's own box (0-100 = viewport).
const PANEL_WIDTH = 140; // wider than the box so the hold has slant margin on both edges
const ANGLE_OFFSET = 15; // horizontal shift between top and bottom edges (the diagonal)

// `edgeX` = x-position (in %) of the panel's bottom-left corner.
// idle: parked far enough left that even with ANGLE_OFFSET the top edge
//   stays negative (fully hidden, no leak).
// covered: pulled far enough left of 0 that, combined with PANEL_WIDTH,
//   both slanted edges clear 0% and 100% with margin (full coverage).
// revealed: pushed far enough right that even the top edge (further right,
//   see ANGLE_OFFSET direction below) clears 100% (fully hidden).
const EDGE_X = {
  idle: -PANEL_WIDTH - ANGLE_OFFSET - 25,
  covered: -20,
  revealed: 120,
};

function clipPathForEdge(edgeX: number): string {
  const topLeft = edgeX + ANGLE_OFFSET;
  const topRight = edgeX + PANEL_WIDTH + ANGLE_OFFSET;
  const bottomRight = edgeX + PANEL_WIDTH;
  const bottomLeft = edgeX;
  return `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`;
}

const panelVariants = {
  idle: { clipPath: clipPathForEdge(EDGE_X.idle) },
  covering: { clipPath: clipPathForEdge(EDGE_X.covered) },
  holding: { clipPath: clipPathForEdge(EDGE_X.covered) },
  revealing: { clipPath: clipPathForEdge(EDGE_X.revealed) },
};

const reducedPanelVariants = {
  idle: { opacity: 0 },
  covering: { opacity: 1 },
  holding: { opacity: 1 },
  revealing: { opacity: 0 },
};

export function PageCurtain() {
  const { phase, label, reportCoverComplete, reportRevealComplete } = useCurtain();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Portal target isn't available during SSR; only render it client-side
  // after mount to avoid a hydration mismatch (same guard used by
  // SiteMobileNav for the same reason).
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = phase !== "idle";

  const handleAnimationComplete = (definition: CurtainPhase | string) => {
    if (definition === "covering") reportCoverComplete();
    if (definition === "revealing") reportRevealComplete();
  };

  const overlay = (
    <div
      aria-hidden={!isActive}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {prefersReducedMotion ? (
        <motion.div
          className="absolute inset-0 bg-primary"
          variants={reducedPanelVariants}
          animate={phase}
          transition={{ duration: REDUCED_DURATION }}
          onAnimationComplete={handleAnimationComplete}
        />
      ) : (
        <motion.div
          className="absolute inset-0 bg-primary"
          variants={panelVariants}
          animate={phase}
          transition={
            phase === "holding" || phase === "idle"
              ? { duration: 0 }
              : { duration: SWEEP_DURATION, ease: EASE_OUT }
          }
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      <AnimatePresence>
        {(phase === "covering" || phase === "holding") && label ? (
          <motion.p
            key={label}
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-[family-name:var(--font-fraunces)] text-3xl text-background md:text-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2, ease: EASE_OUT }}
          >
            {label}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );

  return mounted ? createPortal(overlay, document.body) : null;
}