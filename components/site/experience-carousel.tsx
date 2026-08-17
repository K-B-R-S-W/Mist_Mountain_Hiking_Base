"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

export interface ExperienceCarouselImage {
  id: string;
  url: string;
  alt: string;
}

const AUTO_ADVANCE_MS = 4200;
// How many planes either side of the active one stay mounted — the fan
// only ever shows a handful at once, so nothing further out needs to
// exist in the DOM at all.
const WINDOW = 2;
// Page scroll speed (px/s) that counts as "fast enough to nudge the
// carousel" — this is deliberately well above idle scroll-wheel jitter.
const VELOCITY_ADVANCE_THRESHOLD = 900;
const VELOCITY_ADVANCE_COOLDOWN_MS = 550;

function wrapOffset(index: number, active: number, length: number): number {
  const raw = index - active;
  if (raw > length / 2) return raw - length;
  if (raw < -length / 2) return raw + length;
  return raw;
}

/**
 * "Scroll velocity: 3D planes" — a fan of tilted image planes, one
 * active/centered, the rest stacked and receding either side. Two
 * independent motion sources drive it, deliberately kept on separate
 * transforms so they never fight each other:
 *  - `active` (React state) drives the fan layout itself — position,
 *    rotation, scale, opacity — animated via Motion's `animate` prop.
 *  - page-scroll velocity (smoothed with a spring) drives a small extra
 *    tilt applied underneath that, via `style`, so the whole stack
 *    subtly reacts while the user is actively scrolling past it.
 * Auto-advances on an interval when idle; a fast scroll also advances
 * (or reverses) it directly, satisfying "should go to the next image"
 * both on its own and in response to scroll.
 */
export function ExperienceCarousel({ images }: { images: ExperienceCarouselImage[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const lastVelocityAdvanceRef = useRef(0);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 40, stiffness: 300 });

  // Three fixed derived values (not one per plane — plane count varies
  // with `images`, hook count can't) covering the render window: the
  // active plane barely tilts, the outer ones tilt more, so the effect
  // reads as a wave rippling outward rather than a uniform tilt.
  const waveNear = useTransform(smoothVelocity, [-2200, 0, 2200], [-5, 0, 5], { clamp: true });
  const waveMid = useTransform(smoothVelocity, [-2200, 0, 2200], [-9, 0, 9], { clamp: true });
  const waveFar = useTransform(smoothVelocity, [-2200, 0, 2200], [-13, 0, 13], { clamp: true });
  const waveByDistance = [waveNear, waveMid, waveFar];

  useEffect(() => {
    if (prefersReducedMotion || images.length <= 1) return;
    const id = setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion, images.length]);

  useMotionValueEvent(scrollVelocity, "change", (latest) => {
    if (prefersReducedMotion || images.length <= 1) return;
    const now = performance.now();
    if (
      Math.abs(latest) > VELOCITY_ADVANCE_THRESHOLD &&
      now - lastVelocityAdvanceRef.current > VELOCITY_ADVANCE_COOLDOWN_MS
    ) {
      lastVelocityAdvanceRef.current = now;
      const direction = latest > 0 ? 1 : -1;
      setActive((current) => (current + direction + images.length) % images.length);
    }
  });

  if (images.length === 0) return null;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ perspective: 1200 }}>
      {images.map((image, index) => {
        const offset = wrapOffset(index, active, images.length);
        const distance = Math.abs(offset);
        if (distance > WINDOW) return null;

        return (
          <motion.div
            key={image.id}
            className="absolute inset-0"
            style={{ zIndex: WINDOW + 1 - distance, transformOrigin: "50% 100%" }}
            animate={{
              x: `${offset * 32}%`,
              y: distance * 16,
              rotateZ: offset * 5,
              scale: 1 - distance * 0.09,
              opacity: distance > WINDOW ? 0 : 1 - distance * 0.4,
            }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : DURATION.cinematic,
              ease: EASE_OUT,
            }}
          >
            {/* Separate element for the velocity tilt so it composes
                with (rather than overwrites) the `animate` transform
                above — nested transforms chain instead of colliding. */}
            <motion.div
              className="relative h-full w-full overflow-hidden rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
              style={{ rotate: prefersReducedMotion ? 0 : waveByDistance[distance] }}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority={offset === 0}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
