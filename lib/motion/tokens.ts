// Central motion tokens for Motion (motion/react) components.
// Mirrors the CSS custom properties in app/globals.css (--ease-out,
// --motion-fast/base/slow/cinematic) so JS-driven and CSS-driven motion
// never drift out of sync. Update both places together.

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

export const DURATION = {
  fast: 0.16, // 160ms — button/toggle feedback
  base: 0.22, // 220ms — dropdowns, standard UI
  slow: 0.42, // 420ms — modals, drawers
  cinematic: 0.7, // 700ms — rare marketing/storytelling moments (hero)
} as const;
