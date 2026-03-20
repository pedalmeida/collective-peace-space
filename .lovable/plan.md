

## Problem

The `BackgroundGradientAnimation` is clipped on all sides because the Hero `<section>` has `overflow-hidden`. This creates a hard, visible edge — the gradient stops abruptly at the section boundary instead of fading naturally into the OrgTicker section below.

## Solution

Move the gradient animation out of the Hero section and into a shared wrapper that spans both Hero and OrgTicker. This eliminates the clipping.

### Changes

**1. `src/pages/Index.tsx`** — Wrap Hero + OrgTicker in a `relative` container and place the `BackgroundGradientAnimation` there instead of inside Hero.

```text
<div className="relative overflow-hidden">
  <BackgroundGradientAnimation ... containerClassName="opacity-40 -translate-x-[20%]" />
  <Hero />       ← remove overflow-hidden from Hero
  <OrgTicker />
</div>
```

**2. `src/components/Hero.tsx`**
- Remove `overflow-hidden` from the `<section>` class (keep `relative`).
- Remove the `<BackgroundGradientAnimation>` import and usage — it now lives in the parent wrapper.

**3. `src/components/OrgTicker.tsx`**
- Add `relative z-10` to ensure content stays above the gradient.

This way the gradient bleeds seamlessly from Hero through OrgTicker with no hard edges on any side. The bottom of the wrapper naturally fades since the gradient orbs are radial and dissipate.

