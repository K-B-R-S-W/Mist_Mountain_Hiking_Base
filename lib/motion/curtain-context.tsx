"use client";

/**
 * Page-curtain transition state machine (public site only — mounted in
 * app/(site)/layout.tsx, never in app/admin). See:
 *   - spec-page-curtain-transitions.md (FR-002, FR-005, FR-010)
 *   - plan-page-curtain-transitions.md (Design → State model)
 *
 * Phase lifecycle:
 *   idle -> covering -> holding -> revealing -> idle
 *
 * - idle -> covering: a TransitionLink click passed all guards and called
 *   requestNavigation(href, label).
 * - covering -> holding: the cover sweep's onAnimationComplete fires (called
 *   by PageCurtain via reportCoverComplete) -> we start the real navigation
 *   inside startTransition, so `isPending` becomes the readiness signal.
 * - holding -> revealing: isPending flips false (or the stall ceiling
 *   elapses first) -> we scroll to top and focus <main>, then flip phase so
 *   PageCurtain plays the reveal sweep.
 * - revealing -> idle: the reveal sweep's onAnimationComplete fires (called
 *   via reportRevealComplete).
 *
 * A single shared instance (not one per link) is required so overlapping
 * clicks can't race two curtains — enforced by ignoring requestNavigation
 * calls while phase !== "idle".
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type CurtainPhase = "idle" | "covering" | "holding" | "revealing";

// Stall-protection ceiling: site's own dev-logged Supabase queries run
// 100-700ms (see Next INFO.md); 4000ms gives ~6-10x headroom before we
// assume something is actually hung and force a reveal rather than trap
// the visitor behind the curtain indefinitely.
const STALL_CEILING_MS = 4000;

type CurtainContextValue = {
  phase: CurtainPhase;
  label: string | null;
  requestNavigation: (href: string, label: string) => void;
  /** Called by PageCurtain when the cover sweep finishes animating. */
  reportCoverComplete: () => void;
  /** Called by PageCurtain when the reveal sweep finishes animating. */
  reportRevealComplete: () => void;
  /** Called once by the (site) layout to give the provider a live <main>
   *  element it can scroll-reset and focus during the reveal transition. */
  registerMain: (el: HTMLElement | null) => void;
};

const CurtainContext = createContext<CurtainContextValue | null>(null);

export function useCurtain(): CurtainContextValue {
  const ctx = useContext(CurtainContext);
  if (!ctx) {
    throw new Error("useCurtain must be used within a CurtainProvider");
  }
  return ctx;
}

export function CurtainProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<CurtainPhase>("idle");
  const [label, setLabel] = useState<string | null>(null);

  const pendingHrefRef = useRef<string | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealedRef = useRef(false);

  const registerMain = useCallback((el: HTMLElement | null) => {
    mainRef.current = el;
  }, []);

  const requestNavigation = useCallback(
    (href: string, nextLabel: string) => {
      // Ignore if a cycle is already in flight — prevents a rapid
      // double-click (or two different links) from starting a second
      // curtain mid-cycle.
      if (phase !== "idle") return;
      pendingHrefRef.current = href;
      setLabel(nextLabel);
      setPhase("covering");
    },
    [phase],
  );

  const revealNow = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
    // FR-010: reset scroll and move keyboard/screen-reader focus to the
    // new page's main content before the reveal sweep plays, so the
    // transition doesn't strand scroll position or assistive-tech focus
    // from the previous page.
    window.scrollTo(0, 0);
    mainRef.current?.focus();
    setPhase("revealing");
  }, []);

  const reportCoverComplete = useCallback(() => {
    const href = pendingHrefRef.current;
    if (!href) return;
    revealedRef.current = false;
    setPhase("holding");
    startTransition(() => {
      router.push(href);
    });
    // Stall protection: force a reveal if the real readiness signal
    // (isPending flipping false, handled in the effect below) never
    // arrives within the ceiling.
    stallTimerRef.current = setTimeout(revealNow, STALL_CEILING_MS);
  }, [router, startTransition, revealNow]);

  // Real readiness signal: once the transition's pending state clears, the
  // destination route's RSC payload has actually landed — reveal now
  // rather than on a guessed timer.
  useEffect(() => {
    if (phase === "holding" && !isPending) {
      revealNow();
    }
  }, [phase, isPending, revealNow]);

  const reportRevealComplete = useCallback(() => {
    pendingHrefRef.current = null;
    setLabel(null);
    setPhase("idle");
  }, []);

  return (
    <CurtainContext.Provider
      value={{
        phase,
        label,
        requestNavigation,
        reportCoverComplete,
        reportRevealComplete,
        registerMain,
      }}
    >
      {children}
    </CurtainContext.Provider>
  );
}
