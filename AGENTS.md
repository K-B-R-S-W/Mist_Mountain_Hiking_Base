# Mist Mountain Website — Agent Instructions

## Project

This is the official website for Mist Mountain Hiking Base Udawaththa Bangalore.

Preserve the existing visual identity:
- Nature / mountain / forest atmosphere
- Warm earthy tones
- Editorial and premium feel
- Strong photography
- Spacious layouts
- Elegant typography
- Subtle, intentional motion

Do not redesign the brand unless explicitly requested.

## General Development Rules

Before changing code:

1. Inspect the existing implementation.
2. Reuse existing components, utilities, styles, and patterns where possible.
3. Avoid unnecessary dependencies.
4. Keep changes focused on the requested task.
5. Do not modify unrelated files.
6. Preserve existing functionality.
7. Consider responsive behavior for desktop, tablet, and mobile.
8. Check accessibility and reduced-motion behavior for animations.

## Animation

For animation-related work, use:

skills/mist-mountain-motion-3d/SKILL.md

Follow that skill's principles and implementation rules.

Prefer:
- Motion
- CSS transitions/animations
- transform and opacity
- scroll-based reveals
- subtle parallax
- staggered entrances
- shared element transitions
- purposeful micro-interactions

Avoid:
- excessive animations
- animation on every element
- large layout shifts
- unnecessary JavaScript animation
- animations that slow navigation or booking

Animations should support the experience rather than distract from the hotel content.

## 3D

For 3D-related work, use:

skills/mist-mountain-motion-3d/SKILL.md

Preferred technologies:
- Three.js
- React Three Fiber
- Drei

3D should be used selectively and purposefully.

Prioritize:
- performance
- lazy loading
- mobile compatibility
- accessibility
- graceful fallback
- reduced-motion support

Do not add 3D merely because it is technically possible.

## Next.js

Respect the existing Next.js architecture.

Prefer Server Components by default.

Use `"use client"` only where client-side interaction, animation, WebGL, browser APIs, or state actually requires it.

Keep interactive/animated components isolated rather than converting entire pages into Client Components unnecessarily.

## Performance

Always consider:

- bundle size
- image optimization
- lazy loading
- WebGL cost
- mobile performance
- unnecessary re-renders
- GPU-heavy effects

Do not sacrifice performance for visual effects.

## Accessibility

Interactive elements must remain usable with:

- keyboard navigation
- screen readers where appropriate
- reduced-motion preferences

Respect:

`prefers-reduced-motion`

Never make essential information dependent on animation.

## Design Direction

The site should feel:

"Luxury mountain retreat"

rather than:

"Technology/WebGL showcase"

Motion should feel cinematic, natural and restrained.

3D should feel integrated into the mountain/hospitality experience.

## Booking

The primary business goal is converting visitors into bookings.

Do not let animation or 3D interfere with:

- room discovery
- pricing
- availability
- contact information
- booking CTAs

Important actions should remain obvious and fast.

## Agent Workflow

For significant UI changes:

1. Inspect the relevant existing components.
2. Identify reusable patterns.
3. Implement the smallest clean solution.
4. Check desktop and mobile behavior.
5. Check accessibility.
6. Check performance.
7. Review the final result for visual consistency.

When a task specifically asks to use the motion/3D skill, read:

skills/mist-mountain-motion-3d/SKILL.md

before making changes.

## Do Not

Do not:

- replace the project's design system without permission
- add unnecessary libraries
- rewrite working components unnecessarily
- add animations everywhere
- add 3D everywhere
- remove existing functionality without reason
- ignore mobile behavior
- ignore reduced-motion preferences