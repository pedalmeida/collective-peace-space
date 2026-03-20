

## Add Visual Polish & Distinctive Animations

The site currently uses a basic fade-in `Reveal` component. Here's a plan to add depth and character while maintaining the calm, serene tone.

### 1. Parallax Hero Images
Use `motion/react`'s `useScroll` + `useTransform` to make the three Hero images move at slightly different speeds as the user scrolls, creating a subtle depth effect. The text side stays static while images drift upward at ~0.3x scroll rate.

### 2. Smooth Counter / Number Animation (Next Event)
Animate the event date digits counting up when the NextEvent card enters the viewport, using motion's `useInView` + `animate` on a `MotionValue`. E.g., "29" counts from 0→29 quickly.

### 3. Staggered Card Entrances (Mission & Past Events)
Replace the current delay-based Reveal with motion's `staggerChildren` variant pattern for the Mission values grid and Past Events list — cards slide in from alternating sides with a stagger of ~80ms.

### 4. Magnetic Hover on CTA Buttons
Add a subtle "magnetic" effect to the main CTA buttons: the button slightly follows the cursor position within a small radius (~4px), creating an interactive, tactile feel. Implemented as a reusable `MagneticButton` wrapper using `onMouseMove` + motion `spring`.

### 5. Gradient Accent Line
Add a thin animated gradient line (accent → primary → accent) that spans the full width between major sections, subtly animating its gradient position. Pure CSS animation with a `background-size: 200%` trick.

### 6. Text Reveal for Headlines
For section headlines (h2), replace simple fade with a word-by-word or line-by-line clip reveal — text slides up from behind a mask. Uses motion's `variants` with `clipPath` animation.

### 7. Floating Particles / Dots Background
Add a very subtle, sparse set of small floating dots/circles in the background of the Hero and Participate sections. Pure CSS or motion-animated, slow drift, low opacity (~0.08). Reinforces the meditative atmosphere.

### Technical Approach
- **No new dependencies** — everything uses `motion/react` (already installed) and CSS
- New components: `MagneticButton.tsx`, `TextReveal.tsx`, `FloatingDots.tsx`
- Modified components: `Hero.tsx` (parallax), `NextEvent.tsx` (counter), `Mission.tsx` & `PastEvents.tsx` (stagger), `index.css` (gradient line)
- All animations respect `prefers-reduced-motion` via motion's built-in support

