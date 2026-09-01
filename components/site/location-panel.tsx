"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { hasWebGL } from "@/lib/webgl/detect";
import type { PointerState } from "@/components/site/three/topographic-scene";

// Same CSS fallback used both while an unqualified visitor never fetches
// this chunk at all, and as the dynamic import's loading state — so a
// qualifying visitor sees CSS fallback -> CSS fallback (while the chunk
// streams in) -> 3D, never a blank frame in between.
const CSS_FALLBACK = <div className="location-contours h-full w-full" aria-hidden="true" />;

// Whole three/fiber bundle behind one dynamic import, ssr:false — never
// touches the server render or the homepage's initial JS. Combined with
// the qualifies-gate below, an unqualified visitor (mobile, reduced
// motion, no WebGL) never fetches this chunk at all.
const TopographicLocationScene = dynamic(
  () => import("@/components/site/three/topographic-scene").then((mod) => mod.TopographicLocationScene),
  { ssr: false, loading: () => CSS_FALLBACK },
);

function buildThresholdList(steps = 20): number[] {
  return Array.from({ length: steps + 1 }, (_, i) => i / steps);
}

export function LocationPanel({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const pointer = useRef<PointerState>({ x: 0, y: 0 });

  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [webglOk, setWebglOk] = useState(false);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Synchronous-ish capability checks, once on mount. These gate the
  // decision below, so nothing here ever waits on the 3D chunk itself.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktopViewport(mql.matches);
    const onViewportChange = (event: MediaQueryListEvent) => setIsDesktopViewport(event.matches);
    mql.addEventListener("change", onViewportChange);

    setWebglOk(hasWebGL());

    return () => mql.removeEventListener("change", onViewportChange);
  }, []);

  // qualifies && inView is required before the dynamic import above is
  // ever allowed to render (and therefore fetch). Mobile (<768px),
  // prefers-reduced-motion, and no-WebGL all resolve to the same CSS
  // fallback — one consistent non-3D identity for this section. Even a
  // qualifying visitor sees the CSS fallback until the section actually
  // enters the viewport, so the chunk isn't fetched just because a
  // desktop/WebGL visitor loaded the homepage.
  const qualifies = isDesktopViewport && !prefersReducedMotion && webglOk;

  useEffect(() => {
    if (!qualifies) return;
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting);

        // True section-scroll progress from the bounding rect, not
        // intersectionRatio (which reflects visible-area fraction, not
        // scroll position — wrong for a tall section relative to a
        // short viewport). 0 when the section's top edge reaches the
        // viewport's bottom edge (just beginning to enter), 1 when the
        // section's bottom edge reaches the viewport's top edge
        // (finished leaving).
        const rect = entry.boundingClientRect;
        const viewportHeight = window.innerHeight;
        const totalTravel = viewportHeight + rect.height;
        const raw = totalTravel > 0 ? (viewportHeight - rect.top) / totalTravel : 0;
        scrollProgress.current = Math.min(1, Math.max(0, raw));
      },
      { threshold: buildThresholdList() },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [qualifies]);

  useEffect(() => {
    if (!qualifies) return;
    const node = sectionRef.current;
    if (!node) return;

    // Desktop pointer parallax only — same (hover: hover) and
    // (pointer: fine) convention used sitewide, zero effect on touch.
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      pointer.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      };
    };

    node.addEventListener("pointermove", handlePointerMove);
    return () => node.removeEventListener("pointermove", handlePointerMove);
  }, [qualifies]);

  return (
    <div ref={sectionRef} className={className} aria-hidden="true">
      {qualifies && inView ? (
        <TopographicLocationScene
          active={inView}
          scrollProgress={scrollProgress}
          pointer={pointer}
          fallback={CSS_FALLBACK}
        />
      ) : (
        CSS_FALLBACK
      )}
    </div>
  );
}
