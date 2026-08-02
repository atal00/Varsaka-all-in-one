# Design System — Varsaka Labs v2.0

## 1. Design Philosophy

One sentence: **institutional confidence, not startup decoration.**

Reference benchmark: Tresmares Capital (tresmarescapital.com) — what makes it work isn't complexity, it's *restraint*. Two-color palette, one strong visual metaphor (the mountain — Pico Tres Mares), generous whitespace, typography doing almost all the work. We are translating this restraint to a QA/software-testing brand: no stock photography of people pointing at laptops, no flat icon grids, no emoji, no gradient blob backgrounds, no "AI startup purple-blue gradient" cliché.

Three words that should describe every screen: **precise, calm, earned.**

## 2. What We Are Explicitly Avoiding

Direct response to why the current site feels AI-generated/templated:

- No emoji as bullet markers or section decoration (✅, 🚀, 🎁, etc.)
- No generic 3-color gradient backgrounds behind hero text
- No identical icon-in-circle repeated six times for a service grid
- No stock illustration packs (the "flat people doing tech things" style every SaaS template ships with)
- No card-shadow-everywhere design (drop-shadow on every box is a templated-site tell)
- No more than one accent color doing decorative work at a time
- No centered-everything layouts — asymmetry signals intentional design

## 3. Color System

Inspired directly by the Tresmares restraint (their site uses exactly 2 colors: a strong red #D81413 and white) but adapted to Varsaka's domain — QA/testing maps naturally to a "verified / pass" signal language, so we anchor on a deep ink + a single confident accent rather than red (red skews "alert/danger," wrong connotation for a QA brand whose job is to prevent danger).

```
--ink-900:      #0B0E14   /* primary background, near-black, not pure black */
--ink-800:      #12161F   /* secondary surface */
--ink-700:      #1B212C   /* card/panel surface on dark sections */
--paper-000:    #FAF9F6   /* primary light background — warm off-white, not stark #FFF */
--paper-100:    #F0EEE8   /* secondary light surface */
--graphite-500: #5C6470   /* secondary text on light */
--graphite-300: #8A919C   /* tertiary text / muted */
--signal-500:   #2F6F4E   /* primary accent — deep verified-green, used SPARINGLY (CTA, key underline, count-up numbers) */
--signal-300:   #6FA98A   /* lighter accent for hover/secondary states */
--line-hairline:#D8D5CC   /* 1px dividers on light bg */
--line-hairline-dark: #2A303C /* 1px dividers on dark bg */
```

Usage rule: **80% of every screen is ink/paper neutrals. The signal-500 green appears only on: primary CTA button, the count-up proof numbers, active state of the process-timeline, and one underline/accent stroke in the hero.** If green starts appearing in more than ~5% of pixels on any screen, pull it back — restraint is the entire point.

Dark vs light sections: Hero + Process section run on `--ink-900` (dark, cinematic, matches the "mountain at dusk" feeling of the reference site). Services, Proof Bar, Case Studies, FAQ run on `--paper-000` (light, clean, readable, fast-loading). This alternation also gives scroll-rhythm — visitors feel section transitions without needing heavy dividers.

## 4. Typography

Two typefaces only.

**Display / Headlines:** A grotesk-serif hybrid feels "finance-grade" the way Tresmares' typography does. Recommend **"Fraunces"** (variable, has a soft-serif editorial weight) for hero headline and major section titles — gives the site a non-generic, slightly editorial gravitas that no QA-competitor site has. Fallback stack: `"Fraunces", "Georgia", serif`.

**Body / UI:** **"Inter"** or **"Geist"** for everything else — body copy, nav, buttons, FAQ, captions. Clean, neutral, fast-rendering, excellent at small sizes. Fallback stack: `"Inter", -apple-system, "Segoe UI", sans-serif`.

```
H1 (hero headline):     Fraunces, 64-96px desktop / 36-44px mobile, weight 500, tight tracking (-0.02em), line-height 1.05
H2 (section title):     Fraunces, 40-56px desktop / 28-32px mobile, weight 500
H3 (subsection/card):   Inter, 22-26px, weight 600
Body large:             Inter, 18-20px, weight 400, line-height 1.6
Body default:           Inter, 16px, weight 400, line-height 1.65
Caption / label:        Inter, 13px, weight 500, uppercase, letter-spacing 0.08em (used for "01 / Functional Testing" style labels — NOT for full sentences)
```

No more than 2 weights of Inter loaded (400, 600) + 1-2 of Fraunces (400/500) to keep font payload light — this matters for the performance budget given animation weight elsewhere.

## 5. Layout System

- **Grid:** 12-column, max content width 1280px desktop, with generous outer margin (min 64px desktop, 24px mobile) — whitespace is a feature, not a gap to be filled.
- **Asymmetry by default:** Hero headline left-aligned at ~60% width, not centered. Service-system section uses a pinned label column (left, ~30%) against a scrolling visual column (right, ~70%) — see animation.md for mechanics.
- **Section rhythm:** Every section gets generous vertical breathing room — minimum 120px desktop top/bottom padding, 64px mobile. No section should feel "packed."
- **Dividers:** 1px hairline only (`--line-hairline`), never a thick colored bar. A small numeric label ("02") next to section titles substitutes for decorative icons.

## 6. Iconography Policy

Critical given the "no faltu emoji ya icon" instruction.

- **Default: no icons at all.** Most sections should communicate through typography, layout, and motion — not icon decoration.
- **Where an icon is functionally necessary** (e.g., distinguishing 6 service types at a glance, or UI controls like a close/menu button): custom-drawn, single-weight (1.5px stroke), monochrome line icons matching the ink/paper palette — never filled, never multi-color, never inside a colored circle background. Think "technical drawing," not "app icon."
- Service-section markers use **numerals** (01–06) instead of icons wherever a marker is even needed — numerals read as more confident/editorial and zero risk of looking like clip-art.
- Trust/social-proof section uses **typeset numbers with count-up animation**, not badge graphics, star-rating emoji, or shield icons.

## 7. Imagery Policy

- No stock photography of people. None.
- No generic "code on screen" hero images — every competitor has this, it communicates nothing specific.
- Visual interest comes from the animated SVG/canvas system (animation.md) — abstract, geometric, representing the "testing/verification" metaphor (e.g., a grid of nodes that resolve from red-flagged to green-verified as the user scrolls — this becomes Varsaka's signature visual, equivalent to Tresmares' mountain).
- If real product/dashboard screenshots exist (e.g., a live test-report dashboard), they may be used in the Proof/Case Studies section only, framed minimally (thin 1px border, no drop shadow, no browser-chrome mockup frame unless extremely subtle).

## 8. Buttons & CTA

```
Primary CTA:
  background: var(--signal-500)
  color: var(--paper-000)
  border-radius: 4px   /* not pill-shaped — sharper radius reads more "institutional," pill/rounded reads more "consumer app" */
  padding: 14px 28px
  font: Inter 600, 15px, letter-spacing 0.01em
  hover: background var(--signal-300), 160ms ease

Secondary CTA (text link with arrow):
  color: var(--ink-900) on light / var(--paper-000) on dark
  underline: none by default, 1px underline animates in from left on hover
  arrow (→) as plain text character or thin SVG stroke, animates 4px rightward on hover
```

Never use a glowing/pulsing CTA button — that's a templated-SaaS tell. Confidence is communicated by placement and copy specificity, not by visual noise.

## 9. Motion Language (cross-reference animation.md)

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (a calm "ease-out-expo" feel) for almost everything — nothing bouncy, nothing elastic. Bounce/spring easing reads playful/consumer; Varsaka's brand is precise/institutional.
- Duration: micro-interactions 150-250ms, section-transitions 600-900ms, scroll-linked animations driven by scroll position (not time) wherever possible.
- Respect `prefers-reduced-motion` everywhere — fallback to simple fade/opacity transitions, no scroll-jacking, for accessibility and for SEO crawlers/Lighthouse scoring.

## 10. Responsive Behavior Notes

- Mobile hero animation must degrade to a lighter-weight version (fewer animated nodes, shorter scroll-pin distance) — detailed in animation.md mobile section.
- Service-system horizontal-scroll-link section becomes a simple vertical stack with scroll-triggered fade/slide on mobile — horizontal scroll-jacking on mobile is a known UX failure pattern and hurts mobile usability scores.
- Touch targets minimum 44x44px for all interactive elements (calendar embed, FAQ accordions, nav).

## 11. Component Inventory (for build reference)

1. Sticky nav (transparent over hero, solidifies on scroll with backdrop-blur, ink-900 background once solid)
2. Hero scroll-pinned animation stage
3. Count-up stat component (proof bar)
4. Horizontal scroll-link service-system panel (desktop) / stacked card (mobile)
5. Process timeline with scroll-progress indicator
6. Differentiator block (3-column, numeral-marked, no icons)
7. Case study narrative card (before/after metric + quote, no avatar photo needed — use company-type label instead, e.g., "Series A Fintech")
8. FAQ accordion (minimal, hairline dividers, plus/minus glyph not icon-circle)
9. Footer (dark, minimal — logo wordmark, 3 link columns, single-line copyright, no social icon soup)
10. Calendar embed container (Contact page)
