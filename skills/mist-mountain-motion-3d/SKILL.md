---
name: mist-mountain-motion-3d
description: Project-specific design-engineering skill for the Mist Mountain hotel website. Applies restrained cinematic UI motion, Motion for React transitions, CSS/WAAPI where appropriate, and optional Three.js/React Three Fiber 3D. Audits, designs, implements, and reviews animation/3D while preserving the existing forest/cream/terracotta visual language, performance, accessibility, responsive behavior, and Next.js App Router architecture.
---

# Mist Mountain Motion + 3D

## Purpose

Turn the Mist Mountain website into a polished, cinematic mountain-retreat experience without turning it into a generic "WebGL showcase".

The desired feeling is:

- quiet
- premium
- natural
- editorial
- slightly atmospheric
- fast and usable
- visually memorable

The site already uses:

- Next.js App Router
- React 19
- Tailwind CSS 4
- CSS custom properties in `app/globals.css`
- Fraunces for display typography
- Work Sans for body text
- forest green / moss / warm cream / terracotta palette
- reusable site components under `components/site/`
- dynamic content coming from repositories/actions

Do not replace the site's visual identity to add animation.

---

# 1. Core design rule

Motion is a design tool, not decoration.

Every animation must have at least one purpose:

1. explain spatial change
2. provide feedback
3. preserve continuity
4. reveal hierarchy
5. create a rare moment of delight

When an animation does none of these, remove it.

For this marketing site, favor restrained cinematic motion over aggressive UI motion.

---

# 2. Preferred stack

## UI motion

Primary:

- `motion` / Motion for React when JavaScript-driven orchestration is useful

Use CSS transitions, `@starting-style`, and WAAPI for simple predetermined transitions where they are cleaner.

Do not add GSAP unless a requirement genuinely needs GSAP-level timeline control.

## 3D

Primary:

- `three`
- `@react-three/fiber`
- `@react-three/drei`

Use 3D selectively.

A 3D scene must justify its performance cost.

Good uses for this site:

- subtle mountain / terrain hero element
- stylized property model
- room/property orientation preview
- topographic terrain scene
- small atmospheric decorative object

Avoid:

- full-screen 3D on every page
- interactive 3D behind dense text
- 3D that blocks booking actions
- heavy photorealistic models when a lightweight composition communicates the idea

---

# 3. Existing site motion language

Base motion tokens should live centrally rather than being invented per component.

Recommended additions to `app/globals.css`:

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  --motion-fast: 160ms;
  --motion-base: 220ms;
  --motion-slow: 420ms;
  --motion-cinematic: 700ms;
}
```

These are starting tokens for this site. Keep common UI interactions below 300ms. Longer durations are acceptable for rare marketing-storytelling transitions when they are not blocking interaction.

Never create a second motion-token system inside a component.

---

# 4. Motion rules

## Entering UI

Prefer:

- opacity + small translate
- opacity + scale from approximately `0.95`
- ease-out
- 160–280ms for regular UI

Example:

```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
/>
```

Do not use:

```tsx
initial={{ scale: 0 }}
```

## Exiting UI

Exits may be slightly faster than entrances.

Never make a user wait for a decorative exit animation.

## Hover

Gate hover-only movement:

```css
@media (hover: hover) and (pointer: fine) {
  .image-card:hover img {
    transform: scale(1.025);
  }
}
```

Keep hover movement subtle.

## Press feedback

Useful for buttons and tappable controls:

```css
transition: transform 160ms var(--ease-out);

:active {
  transform: scale(0.97);
}
```

Do not use large bounce effects on frequent actions.

## Lists and grids

Use a restrained 30–80ms stagger for occasional marketing content.

Do not stagger large/high-frequency functional lists.

## Scroll reveal

Use scroll-triggered reveals for:

- section headings
- editorial image/text blocks
- room cards
- experience cards
- gallery groups

Do not animate every paragraph individually.

A section should feel like one composition.

---

# 5. Reduced motion

Respect the user's preference.

For JS-driven Motion components, prefer:

```tsx
const prefersReducedMotion = useReducedMotion();
```

Then remove large movement while preserving essential state communication.

For CSS, the project already has a reduced-motion rule. Preserve it and extend it when adding new movement.

Do not force users to watch long cinematic sequences when reduced motion is enabled.

---

# 6. Mist Mountain motion recipes

## Hero

Goal: cinematic arrival.

Recommended:

1. hero image begins slightly scaled, e.g. `1.04`
2. image settles to `1`
3. title fades/slides in
4. location eyebrow arrives first
5. subtitle follows shortly after
6. no excessive bounce

Do not animate the whole hero from the bottom at once.

Suggested timing:

- eyebrow: 350–500ms
- title: 450–650ms
- subtitle: 250–400ms
- stagger: 40–80ms

Hero animation may be longer because it is an occasional marketing experience.

## Hero parallax

Use very small movement.

Prefer transform-based parallax.

Never tie scroll position to expensive layout properties.

On mobile, reduce or disable parallax when it hurts performance.

## Image reveals

Use clipping/masking or transform + opacity when helpful.

The reveal should support the feeling of a photographic editorial layout.

Avoid flashy diagonal wipes unless the design explicitly calls for them.

## Room cards

Default:

- image hover scale: around 1.02–1.04
- content stays stable
- CTA underline/opacity feedback is subtle

The card should remain useful without animation.

## Gallery

Good choices:

- shared-image transition
- gentle scale on selected image
- horizontal drag on dedicated gallery interactions
- modal/lightbox with short opacity + transform transition

Do not make a gallery impossible to browse quickly because of animation.

## Navigation

Desktop:

- active-link underline/color transition
- subtle header background transition when scrolled, if needed

Mobile:

- drawer should move from its actual edge
- use transform + opacity
- transform origin should match the physical direction

## Booking CTA

Booking is the highest-value action.

Keep it exceptionally clear.

Animations can communicate press state but must never delay booking.

---

# 7. 3D architecture

Create 3D as isolated React components.

Recommended structure:

```text
components/
  site/
    motion/
      reveal.tsx
      image-reveal.tsx
      magnetic-link.tsx
      stagger.tsx
      page-transition.tsx
    three/
      mountain-scene.tsx
      terrain.tsx
      property-model.tsx
      topographic-scene.tsx
      three-canvas.tsx
```

If a page does not need 3D, it should not load the 3D scene.

Keep the 3D scene client-side and lazy-loaded.

Example pattern:

```tsx
const MountainScene = dynamic(
  () => import("@/components/site/three/mountain-scene"),
  { ssr: false }
);
```

Load the scene only where it appears.

---

# 8. 3D performance rules

Target a visually rich scene with a small rendering budget.

Prefer:

- low-poly geometry
- instancing for repeated objects
- compressed textures
- baked lighting when possible
- low-resolution environment maps
- simple materials
- limited lights
- device pixel ratio caps
- lazy loading
- no unnecessary post-processing

Use renderer settings that prevent high-DPR mobile devices from rendering unnecessarily expensive frames.

Avoid:

- huge textures
- hundreds of separate meshes when instancing works
- continuous animation when the object is off-screen
- physics unless it communicates something meaningful
- expensive post-processing everywhere

Pause or reduce animation when the scene is not visible.

---

# 9. 3D interaction philosophy

Interaction should be obvious and gentle.

Good:

- slight camera/parallax response to pointer movement
- slow automatic rotation for a decorative object
- drag-to-rotate property model
- scroll-driven camera movement for one major storytelling section

Bad:

- camera spinning aggressively
- objects following the mouse at high speed
- physics-based gimmicks
- 3D blocking text
- interaction required to understand basic information

Provide a non-3D fallback whenever practical.

---

# 10. Recommended 3D experiences for Mist Mountain

Prioritize in this order:

### A. Hero mountain atmosphere

Lightweight 3D terrain / mist / contour-inspired scene.

Use it as a secondary visual layer, not as the entire hero.

### B. Property model

A small stylized model of the bungalow/property.

Useful on the About or Rooms experience.

The user can gently rotate the property.

### C. Topographic location section

A stylized terrain surface showing the property's mountain context.

This fits the existing `contour-divider` visual language very well.

### D. Room orientation

Optional. Only build this if usable room geometry/assets exist.

---

# 11. Motion + 3D should work together

Do not treat 3D and UI as separate gimmicks.

Example hero sequence:

1. page loads
2. background photo/3D terrain settles
3. foreground title reveals
4. mouse movement produces a tiny 3D depth response
5. scroll transitions the hero out
6. next editorial section reveals

The user should perceive one coherent scene, not "a Three.js demo plus some animations."

---

# 12. Accessibility

All motion must respect:

- `prefers-reduced-motion`
- keyboard navigation
- focus visibility
- touch interaction
- readable text contrast

Never use animation as the only indication of state.

Do not hide important content until animation finishes.

For 3D:

- keyboard users must still access all meaningful information
- provide normal text/UI alternatives
- decorative 3D should be `aria-hidden="true"` when it adds no semantic content

---

# 13. Next.js rules

Do not turn entire server-rendered pages into client components just to add animation.

Prefer small client components.

Bad:

```tsx
"use client";

export default function HomePage() {
  // entire page becomes client-side
}
```

Better:

```tsx
// server component page
<HeroMotion title={settings.heroTitle} />
```

where `HeroMotion` is the small client component.

Keep repositories, settings, room queries, booking data, and SEO metadata server-side.

Only animation/interaction boundaries should become client-side.

---

# 14. Implementation workflow

When asked to improve the site's motion:

### Phase 1 — Audit

Inspect:

- `app/(site)/`
- `components/site/`
- `app/globals.css`
- package.json
- existing transitions
- hover states
- conditional renders
- image components
- navigation
- gallery
- room cards

Report:

- existing motion
- missing motion opportunities
- unnecessary motion
- accessibility issues
- performance risks

### Phase 2 — Design

Propose the smallest set of high-impact changes.

Prioritize:

1. hero
2. navigation
3. image reveals
4. room cards
5. gallery
6. CTA feedback
7. optional 3D

### Phase 3 — Implement

Use small reusable components.

Do not duplicate animation code across pages.

### Phase 4 — Review

Check:

- mobile
- desktop
- reduced motion
- keyboard
- slow CPU/device
- image loading
- 3D loading
- no layout shift
- booking CTA remains obvious

---

# 15. Agent modes / invocation contract

When this skill is invoked, support these modes:

## `audit`

Read-only audit.

Output:

- motion/3D findings
- exact file paths
- severity
- recommendation
- no source changes

## `plan`

Create a self-contained implementation plan for selected improvements.

The plan must include:

- file paths
- components to add/change
- dependency changes
- exact motion behavior
- accessibility behavior
- performance constraints
- verification steps

## `motion`

Implement animation improvements only.

Do not add 3D unless explicitly requested.

## `3d`

Implement the selected 3D experience.

Before adding dependencies, verify package.json.

Isolate the 3D scene from server components.

## `all`

Use the full workflow:

1. audit
2. choose highest-value motion opportunities
3. design 3D only where it adds real value
4. implement reusable motion primitives
5. implement one high-value 3D experience
6. review performance/accessibility
7. verify the booking flow remains frictionless

## `review`

Review only the motion/3D changes in the current diff.

Block:

- `transition: all`
- `scale(0)`
- `ease-in` for normal UI interactions
- layout-property animation
- unbounded hover motion
- missing reduced-motion behavior
- 3D loaded globally when only one route needs it
- unnecessary heavy models/textures
- animations that delay booking or navigation

---

# 16. Recommended implementation order for this repository

Start with:

### Stage 1 — Motion foundation

Add:

```text
components/site/motion/
  reveal.tsx
  image-reveal.tsx
  stagger.tsx
```

and centralized motion tokens.

### Stage 2 — Homepage

Improve:

- hero arrival
- image movement
- section reveal
- room cards
- experiences image
- testimonial entrance

### Stage 3 — Navigation and transitions

Improve:

- mobile drawer
- active nav
- booking CTA feedback
- page/room transition where appropriate

### Stage 4 — 3D

Install:

```bash
npm install motion three @react-three/fiber @react-three/drei
```

Then create one 3D experience first.

Do not install several 3D helper libraries without a concrete requirement.

### Stage 5 — Review

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Then manually test desktop and mobile.

---

# 17. Agent decision rules

Before implementing an animation, ask:

1. Why is it moving?
2. How often will users see it?
3. Does it help understanding or continuity?
4. Can the same idea be communicated with less movement?
5. Is the movement GPU-friendly?
6. Does it work with reduced motion?
7. Does it preserve the site's quiet mountain-retreat personality?

Before implementing 3D, ask:

1. What real information or emotion does 3D communicate?
2. Is there a lighter 2D solution?
3. Is the 3D asset available or must it be created?
4. What is the mobile fallback?
5. What is the loading cost?
6. Can it be lazy-loaded?
7. Does it interfere with booking or readability?

If the answer to the first question is weak, do not implement the effect.

---

# 18. Agent prompt examples

Use these prompts after the skill is installed.

### Audit

```text
Use the mist-mountain-motion-3d skill in audit mode.
Audit the entire public-facing site for motion and 3D opportunities.
Do not change source files.
Prioritize the homepage, navigation, rooms, experiences, gallery, and booking CTA.
```

### Implement motion

```text
Use the mist-mountain-motion-3d skill in motion mode.
Implement the highest-value animation improvements for the homepage.
Keep the existing visual identity.
Do not add 3D yet.
Run lint, typecheck, and build after the changes.
```

### Implement 3D

```text
Use the mist-mountain-motion-3d skill in 3d mode.
Add one lightweight 3D mountain/terrain experience to the homepage hero.
Use Three.js + React Three Fiber.
Lazy-load it, cap rendering cost, support reduced motion, and provide a mobile-safe fallback.
Do not replace the existing hero content.
```

### Everything

```text
Use the mist-mountain-motion-3d skill in all mode.
Audit the public site first, then implement the highest-value motion improvements and one high-value 3D experience.
Keep the site cinematic, quiet, premium, and natural.
Do not turn every section into an animation.
Protect performance, accessibility, SEO, and the booking CTA.
```
