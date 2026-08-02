# Animation Spec — Varsaka Labs v2.0
### Reference: tresmarescapital.com hero/scroll system

## 1. What Tresmares Actually Does (analysis)

Based on direct research (Awwwards feature breakdown + jury notes), the Tresmares site's award-nominated elements are tagged specifically as: **"Mountain animation"** (hero) and **"Motion services"** (a scroll-linked services section), built with **GSAP + Vanilla JS + SVG**, using **parallax and scroll-triggered sequencing**, on a strict 2-color palette. It is categorized under Business & Corporate / Institutions / Minimal / Clean / Parallax / Scrolling.

The mechanism (standard pattern for this category of site, consistent with the GSAP/SVG/parallax tags):
1. Hero section is **pinned** (locked in viewport) for a scroll distance of roughly 150-300vh while a layered SVG illustration (the mountain, "Pico Tres Mares") animates through stages — peaks rising/parallaxing at different speeds, line-art revealing via stroke-draw, light/atmosphere shifting — purely tied to scroll progress (`ScrollTrigger.scrub`), not autoplay.
2. Once the pin releases, content unpins and normal vertical scroll resumes into the next section.
3. The "Motion services" section uses a similar scroll-scrub technique at smaller scale — each service panel animates in/transforms as it enters/exits view, horizontally or with depth, driven by scroll position.
4. Typography is large, restrained, appears via simple clip/fade-up reveals — the *background visual* carries the spectacle, not the text animation.

Varsaka adaptation principle: **same mechanism, different metaphor.** Instead of a mountain, Varsaka's signature visual is **"The Quality Gate"** — a grid/lattice of nodes representing features/code-paths that get tested; as the user scrolls, red/flagged nodes resolve into green/verified nodes in a wave, ending in a clean, fully-verified grid right as the headline locks into place. This is conceptually honest to what Varsaka does (testing finds and resolves issues before they ship) and gives an equally strong, ownable visual identity.

## 2. Hero Animation Spec — "The Quality Gate"

### 2.1 Structure

```
[Pin container: height = 100vh, pinned for 220vh of scroll distance]
  Layer 0 (background): --ink-900 solid, subtle vignette (radial-gradient, barely visible)
  Layer 1 (SVG node-grid): ~140-220 nodes arranged in a loose, organic (not rigid-grid) 
            scatter across the viewport, connected by thin lines (like a circuit / constellation)
  Layer 2 (headline text): centered-left, large Fraunces type, revealed in stages
  Layer 3 (CTA): fades in only after animation reaches ~80% progress
```

### 2.2 Scroll-Linked Sequence (progress 0 → 1 across the 220vh pin distance)

| Progress | What happens |
|---|---|
| 0 – 0.15 | Node grid fully visible, ALL nodes rendered in a dim red/amber "unverified" state (`--graphite-300` outline, faint red fill at low opacity — signals "unchecked," not alarm). Headline line 1 fades up: "Software ships with bugs." |
| 0.15 – 0.45 | A scroll-driven wave sweeps left→right across the node grid. Each node it touches flips from unverified to verified (`--signal-500` green fill, brief 200ms scale-pulse 1→1.15→1 on flip, GSAP `stagger` keyed to scroll progress not time). Connecting lines between two verified nodes draw themselves (stroke-dashoffset animation tied to scroll). Headline line 1 fades out, line 2 fades up: "We make sure yours doesn't." |
| 0.45 – 0.7 | Camera/scene parallax: node grid layer drifts slightly slower than foreground (depth via differing `yPercent` scrub multipliers, classic parallax), giving dimensionality. Headline settles into final resting position, slightly smaller, top-left of viewport. |
| 0.7 – 0.85 | Remaining nodes (5-10%, intentionally left amber) flip to green in a final cluster — represents "the last edge cases" — slight delay/easing difference from the main wave to create a satisfying "last piece clicks" moment. |
| 0.85 – 1.0 | Full grid green/verified, settles into a calm idle (very slow ambient drift, like a heartbeat — nodes pulse opacity 0.9↔1.0 over 4s loops, decorative only, GSAP timeline separate from scroll-scrub). CTA button fades up: "Book a Free QA Audit." Sub-line fades in: trust stat ("25+ teams trust Varsaka to ship clean"). |

### 2.3 Technical Implementation Notes

- **Library:** GSAP + ScrollTrigger (matches Tresmares' actual stack — proven for this exact pattern, excellent scrub performance, industry standard for this style of site). Avoid Lottie/heavy video for the hero — SVG manipulation via GSAP keeps payload tiny (a Lottie/video hero is exactly the kind of bloat that tanks LCP and feels "templated," ironically).
- **Pin mechanism:** `ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '+=2200', pin: true, scrub: 1 })` — scrub value of ~0.5-1 gives a slightly smoothed (not laggy, not instant) feel matching the reference site's calm easing language.
- **Node count budget:** Cap at 180 nodes desktop / 70 nodes mobile. Each node + its 2-3 connector lines = cheap SVG, but GSAP animating hundreds of DOM-driven SVG attributes can jank — batch via a single timeline driving a small number of CSS custom properties / use `will-change: transform` sparingly, and prefer animating `<g>` group opacity/transform over individual node recalculation where possible.
- **Color flip technique:** Pre-render both states as two overlapping `<circle>` elements per node (red one on top, green one beneath, red fades opacity 1→0) rather than re-coloring fill live — cheaper for the GPU, avoids repaint costs of changing `fill` attribute directly on many elements.
- **Headline reveal:** Simple `clip-path` or `y + opacity` reveal via GSAP, NOT scramble-text/typewriter effects — those read as gimmicky/templated. Confidence = restraint here too.

## 3. Section 2 — "Motion Services" Equivalent (Service System Section)

Mirrors Tresmares' second flagship element. Six services (Functional, Automation, Performance, Security, AI-Powered QA, Mobile) presented as a connected, scroll-driven sequence rather than a static grid.

### Desktop behavior

- Pinned container, ~30% width left column holds a numeral + active service name (sticky, updates as user scrolls — "01 / Functional Testing" → "02 / Automation Testing" etc., text cross-fades on change).
- 70% width right column scroll-snaps or scroll-scrubs through 6 panels, each panel containing a small abstract SVG motif unique to that service (e.g., automation = a looping infinite-symbol line-path animating its stroke; security = a node with a shield-outline drawn via stroke-path, no filled icon; performance = a simple animated line-graph trace) + one sentence outcome statement.
- Transition between panels: simple opacity + 24px translateY cross-fade, scroll-scrubbed (`ScrollTrigger` with multiple labeled sections within one pin, or 6 separate shorter `ScrollTrigger` instances with `toggleActions`).

### Mobile behavior

- **No horizontal scroll-jacking on mobile** (explicitly avoided — known UX/usability failure pattern, and Tresmares itself shows that heavy interaction sites can lose usability points vs design points). Instead: simple vertical stack, each service block fades/slides up into view on scroll-enter via `ScrollTrigger.toggleActions('play none none reverse')`, no pinning.

## 4. Process Timeline Animation (Section 5 of homepage)

- A horizontal line (desktop) representing the 4-step engagement process, with a small dot/progress-fill that animates left-to-right as the section scrolls through view (`ScrollTrigger` scrubbing a `clip-path` or `scaleX` on the progress line).
- Each step's label and one-line description fades up as the progress-fill reaches it — directly ties scroll position to narrative progress, same scrub principle as the hero, smaller scale.
- Mobile: vertical version of the same line, progress-fill animates top-to-bottom.

## 5. Micro-interactions (global)

- **Count-up numbers** (Proof Bar): GSAP `ScrollTrigger` + simple numeric tween from 0 to target value, triggered once on enter (`once: true` to avoid re-triggering on scroll-back, which feels glitchy).
- **Nav solidify on scroll:** transparent over hero → `backdrop-filter: blur(12px)` + `--ink-900` background at ~85% opacity once scrolled past hero, transition 300ms ease.
- **Link/button hover states:** per design.md button spec — underline draw-in (`transform: scaleX(0→1)`, transform-origin left, 200ms) for text links; background color shift for primary CTA, no scale-bounce.
- **FAQ accordion:** height auto-animate via GSAP (or native `<details>` with a CSS height transition fallback) + plus-to-minus glyph rotation (45deg), 200ms.

## 6. Performance & Accessibility Safeguards

- **`prefers-reduced-motion: reduce`** — entire hero falls back to a static final-state image (the fully-verified green grid) with a simple fade-in, no pin/scrub at all. Same fallback logic applies to the services section (no pin, just simple fade-up per block — which is also exactly the mobile behavior, so this fallback path is already built/tested by virtue of the mobile implementation).
- **Lazy-mount the GSAP/ScrollTrigger bundle** — don't block initial paint; load animation JS after critical CSS/HTML/fonts are in, hero renders in its "resting visible" state immediately and animation logic attaches progressively (avoids layout shift / blocking LCP).
- **SVG over canvas over video/Lottie**, in that preference order, for this specific use case — SVG is lightest, most crawlable, scales losslessly, and is the same stack the reference site itself uses.
- **Idle ambient pulse** (section 2.2, step 0.85-1.0) must be paused via `visibilitychange`/`IntersectionObserver` when hero scrolls out of view — never run decorative animation loops off-screen, this silently drains battery/CPU and is a common audit flag.
- **Test on mid-tier Android device, not just desktop Chrome** — scroll-scrub animations are the #1 source of janky mobile experiences if not budget-tested early.

## 7. Animation Inventory Summary (build checklist)

- [ ] Hero: pinned node-grid scroll sequence (red→green wave + parallax + headline stages)
- [ ] Hero: ambient idle pulse loop (paused off-screen)
- [ ] Hero: reduced-motion static fallback
- [ ] Services: desktop pinned scroll-link 6-panel sequence with sticky numeral label
- [ ] Services: mobile vertical fade-stack fallback
- [ ] Process: scroll-scrubbed progress line (horizontal desktop / vertical mobile)
- [ ] Proof bar: count-up numbers, trigger-once
- [ ] Nav: scroll-solidify transition
- [ ] Buttons/links: hover micro-interactions
- [ ] FAQ: accordion expand/collapse
