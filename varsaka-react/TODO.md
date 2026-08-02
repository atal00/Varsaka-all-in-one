# TODO — Varsaka Labs Website Build

Granular task list derived from `workflow.md` (3 phases + §6 quality gates), adapted to the
**React + Vite** stack mandated by `tech_stack.md` (which overrides `workflow.md` §2's Next.js suggestion).
Cross-referenced checklists pulled in verbatim: `animation.md` §7 (Animation Inventory), `workflow.md` §6
(Quality Gates), `tech_stack.md` §4 (Mandatory Mitigations).

Legend: `- [ ]` not started · `- [x]` done · update checkboxes as work completes.

---

## Phase 0 — Project Scaffold (React + Vite, per tech_stack.md)

> Not a numbered workflow phase, but required setup before Phase 1 Step 1. Stack must be approved first.

- [x] Scaffold Vite + React 18 project (pinned React 18.3 / Vite 5.4 / Tailwind 3.4 for toolchain stability)
- [x] Install runtime deps: `react-router-dom`, `gsap` (head handled by vite-react-ssg, not react-helmet-async — see note below)
- [x] Install dev deps: `tailwindcss`, `postcss`, `autoprefixer`
- [x] Install + configure prerender solution — **vite-react-ssg** (replaces react-snap, which pulled abandoned Puppeteer 1.20) — tech_stack.md §4.1
- [x] Create folder structure per tech_stack.md §5: `/src/components`, `/sections`, `/pages`, `/content`, `/styles`, `/animations`, `/hooks`; `/scripts`; `/public`
- [x] Set up React Router v6 route map per tech_stack.md §6 (home, 6 service routes, process, about, pricing, contact; /work + /blog deferred to Phase 3)
- [x] Per-route `<head>` via vite-react-ssg `Head` (`src/components/Seo.jsx`) — supersedes react-helmet-async (tech_stack.md §4.4); verified baked into prerendered HTML
- [x] Add `public/robots.txt` (links sitemap)
- [ ] Replace placeholder favicon + add real `og-image` (Phase 1/2 — needs brand asset)
- [x] Verify: `npm run build` prerenders all 11 routes to real HTML + generates `sitemap.xml`

---

## Phase 1 — Foundation + Homepage

### Step 1 — Design tokens setup
- [x] Define design.md §3 color tokens as CSS custom properties in `src/styles/tokens.css`
- [x] Map tokens into `tailwind.config.js` (colors, spacing, max-width 1280, outer margins 64/24px) — design.md §5
- [x] Configure typography: Fraunces (400/500) + Inter (400/600) only; `font-display: swap` (Google Fonts) — design.md §4 (specific-file preload deferred to Step 6 §4.6)
- [x] Implement type scale (H1/H2/H3/body-lg/body/caption, responsive clamp) — design.md §4
- [x] Set global easing var `cubic-bezier(0.22,1,0.36,1)` + duration conventions — design.md §9
- [x] Build internal styleguide page at `/dev/styleguide` (unlinked, noindex): tokens, type scale, button states, hairline — workflow.md P1 S1

### Step 2 — Static layout shells (NO animation yet)
- [x] Sticky Nav component (renders solidified ink-900 + backdrop-blur; transparent-over-hero transition deferred to Step 5) — design.md §11.1
- [x] Footer component (dark, minimal: wordmark, 3 link columns incl. all 6 service links, single-line copyright, no social icon soup) — design.md §11.9, seo.md §3.5
- [x] Section 1 — Hero static shell: real H1/subhead resting-state text + CTA (real DOM, not animation-gated) — prd.md §8.1
- [x] Section 2 — Proof Bar static (text-only stat strip; placeholder figures flagged) — prd.md §8.2
- [x] Section 3 — The Problem narrative section — prd.md §8.3
- [x] Section 4 — Services-as-system static layout (numeral-marked 01–06 panels, no horizontal scroll yet) — prd.md §8.4
- [x] Section 5 — How We Work / Process (4 steps static) — prd.md §8.5
- [x] Section 6 — Why Varsaka / 3 differentiators (numeral-marked, no icons) — prd.md §8.6
- [x] Section 7 — Proof / Case highlights (3 narrative cards, company-type labels, no avatars) — prd.md §8.7
- [x] Section 8 — FAQ (tightened copy, hairline dividers, plus/minus glyph, native details) — prd.md §8.8
- [x] Section 9 — Final CTA ("Book a Free 30-Minute QA Audit") — prd.md §8.9
- [x] Lock homepage copy (Content gate: reads & convinces with zero motion; all copy in prerendered HTML) — workflow.md P1 S2
- [ ] NOTE: placeholder figures (25+/85%/300+) + case-study specifics need real data before launch (prd.md §11)

### Step 3 — Hero animation: "The Quality Gate"  (BUILT — visual scroll behavior pending browser/device check in Step 6)
- [x] Build in isolation at `/dev/hero-test` (route added) — workflow.md P1 S3
- [x] Lazy-mount GSAP + ScrollTrigger bundle (dynamic import after paint) — animation.md §6
- [x] SVG node-grid: organic jittered scatter (seeded/deterministic for hydration), 150 desktop / 60 mobile (within 180/70 cap), connector lines — animation.md §2.1, §2.3
- [x] Two-overlapping-`<circle>` color-flip technique (red on top fades to reveal green beneath) — animation.md §2.3
- [x] Pin container ~220vh (`end:'+=2200'`), `scrub` 0.8 — animation.md §2.2
- [x] Progress 0–0.15: hold unverified grid + headline line 1 — animation.md §2.2
- [x] Progress 0.15–0.45: L→R verify wave (x-keyed stagger), connector draw-in, headline line 2 swap — animation.md §2.2
- [x] Progress 0.45–0.7: parallax depth (grid yPercent) — animation.md §2.2
- [x] Progress 0.7–0.85: late "edge case" cluster flips green — animation.md §2.2
- [x] Progress 0.85–1.0: CTA + trust sub-line fade up — animation.md §2.2
- [x] Ambient idle pulse loop (separate paused timeline) — animation.md §2.2
- [x] Pause ambient pulse off-screen via IntersectionObserver — animation.md §6
- [x] Reduced-motion fallback: no pin/scrub, static final green grid — animation.md §6
- [x] Reserve explicit CSS min-height on pin container (`min-h-[88vh]`; grid client-only & absolute) — seo.md §4
- [x] H1 real DOM in prerender, readable at progress=0 (verified in build) — workflow.md P1 S3
- [x] Wire hero into real homepage
- [ ] ⚠ VISUAL CONFIRM (needs browser/device): red→green wave timing, no jank, no layout shift on attach — fold into Step 6 device test

### Step 4 — Services-system scroll section  (BUILT — desktop scrub pending browser check)
- [x] Desktop: pinned stage, sticky left column (numeral + active service name), right column cross-fades through 6 panels via scroll-mapped active index — animation.md §3
- [x] Per-panel abstract line-motif SVGs (1.5px stroke, no fill/circle — automation=infinity, security=shield outline, performance=graph trace, etc.) — animation.md §3, design.md §6
- [x] Panel transition: opacity + 24px translateY cross-fade — animation.md §3
- [x] Secondary CTA per service: "See how we approach [X] →" linking to service page — prd.md §8.4
- [x] Mobile/SSR: genuine vertical stack (all 6 panels as content, no horizontal scroll-jacking) — animation.md §3, design.md §10
- [x] Min-height on pinned stage (`min-h-screen`) — seo.md §4
- [ ] ⚠ VISUAL CONFIRM (browser): pin feel calm not jarring; mobile is true stack not squeezed desktop

### Step 5 — Remaining homepage section animations (in order)
- [x] Proof bar count-up numbers, trigger-once (IntersectionObserver+rAF; final value in prerender, verified) — animation.md §5
- [x] Process timeline scroll-scrubbed progress line (GSAP; horizontal desktop / vertical mobile) — animation.md §4
- [x] Differentiators reveal (fade-up, IO) — design.md §11.6
- [x] Case study cards reveal (fade-up, IO, staggered) — design.md §11.7
- [x] FAQ accordion expand/collapse + plus→minus glyph rotation (45deg, native details + CSS) — animation.md §5
- [x] Nav scroll-solidify transition (transparent over hero → ink-900/95 + backdrop-blur, 300ms) — animation.md §5
- [x] Button/link hover micro-interactions (underline scaleX draw-in, CTA bg shift, no bounce) — design.md §8, animation.md §5

### Step 6 — Performance pass (MANDATORY before Phase 1 done)
- [x] Apply tech_stack.md §4 mitigations — see block below (prerender, code-split, fonts self-hosted, sitemap, lazy GSAP, reserved heights)
- [ ] ⚠ Run Lighthouse/PageSpeed on built homepage — **mobile AND desktop** — **USER ACTION: cannot run headless Chrome in this env** (`npm run build && npm run preview`, then Lighthouse) — workflow.md P1 S6
- [ ] ⚠ Verify LCP < 2.5s (measure) — seo.md §4
- [ ] ⚠ Verify INP < 200ms (measure) — seo.md §4
- [ ] ⚠ Verify CLS < 0.1 (measure) — seo.md §4
- [ ] ⚠ Verify Time-to-first-CTA-visible < 4s (measure) — prd.md §10
- [x] Setup for the above: fonts self-hosted + swap · GSAP lazy/dynamic-imported · reserved heights on pinned sections (min-h) — workflow.md P1 S6
- [ ] (Micro-opt) explicit `<link rel=preload>` for latin woff2 — needs build-time hash inject; marginal given same-origin

### Step 7 — Contact page + Cal.com embed
- [x] Contact page layout — design.md §11.10
- [x] Cal.com embed (inline booking) — **placeholder calLink `varsaka/qa-audit`, replace with real event** — tech_stack.md §2
- [x] Short qualifying form: company, what you're testing, timeline (mailto fallback — wire to Formspree/endpoint before launch) — workflow.md P1 S7
- [x] 44×44px touch targets on form/buttons — design.md §10

### tech_stack.md §4 — Mandatory Mitigations (no-SSR; enforced in Step 6)
- [x] §4.1 Static prerendering: each route ships real pre-rendered HTML with content (verified: root div non-empty, real H1/title per route) — *highest-priority SEO step*
- [x] §4.2 Hero H1 present in prerendered HTML from first paint; GSAP only enhances after — verified with real hero (grid client-only, H1 in prerender)
- [x] §4.3 Code-split GSAP + per-route bundles (verified: each route is its own chunk; gsap/router manualChunks, client-build only)
- [x] §4.4 Per-route meta via vite-react-ssg Head, captured into prerendered HTML (verified per-route title/desc/canonical/og)
- [x] §4.5 `sitemap.xml` generated at build time via `/scripts/generate-sitemap.js` (verified: 11 URLs)
- [x] §4.6 Fonts self-hosted via @fontsource (same-origin, swap, 2 weights each); critical CSS is 4.3KB gzip (render-blocking impact negligible — inlining skipped as marginal, documented)

### Phase 1 EXIT CRITERIA (workflow.md §3)
- [x] Homepage + Contact built & prerendering (all sections + Cal embed)
- [ ] ⚠ Passes Core Web Vitals targets — **USER must measure (Lighthouse); cannot run here**
- [x] Reduced-motion fallback implemented (hero static green grid, services stack, no scrubs) — ⚠ visual confirm with device test
- [ ] ⚠ Mobile experience tested on real mid-tier device — **USER action** — animation.md §6
- [~] Quality Gates §6 run: Content ✓ · Brand-restraint ✓ · Accessibility ⚠ (CTA hover contrast finding — see report) · Performance ⚠ (setup done, measurement = user)

---

## Phase 2 — Service Pages, About, Pricing

### Step 1 — Build one service page as the template (Automation Testing)
- [x] `ServicePage` component + `/content/services.js` data pattern (template + data, not 6 page files) — tech_stack.md §5/§6
- [x] Mini hero (no full scroll-pin — lighter than homepage) — workflow.md P2 S1
- [x] Sections: what-we-test · tools-used · typical engagement · deliverable · service-specific FAQ · CTA — workflow.md P2 S1, prd.md §9
- [x] seo.md keyword/meta applied while writing — workflow.md P2 S2

### Step 2 — Replicate template for remaining 5 services
- [x] Functional Testing — kw: functional testing services
- [x] Performance Testing — kw: performance testing services
- [x] Security Testing / VAPT — kw: VAPT testing company
- [x] AI-Powered QA — kw: AI-powered QA services
- [x] Mobile App Testing — kw: mobile app testing company
- [x] Cross-link each service page to 2 related services + Pricing + Process — seo.md §3.5

### Step 3 — About page
- [x] Founder story, why Varsaka exists, honest team framing (founder bio placeholder flagged) — workflow.md P2 S3

### Step 4 — Pricing page
- [x] Engagement models (fixed-price / retainer / T&M) with starting-from ranges (placeholder figures flagged) — workflow.md P2 S4, prd.md §9

### Step 5 — Schema markup pass
- [x] `Organization` schema on every page (via Layout) — seo.md §3.3
- [x] `Service` schema on each service page (serviceType, provider, areaServed) — seo.md §3.3
- [x] `FAQPage` schema on homepage, each service page, and Pricing — seo.md §3.3
- [x] `BreadcrumbList` schema for /services/* — seo.md §3.3
- [x] Review/AggregateRating intentionally omitted (no fabricated ratings) — seo.md §3.3
- [ ] ⚠ Validate via Google Rich Results Test — **USER action (needs live/deployed URL)** — workflow.md P2 S5
- [x] sitemap.xml covers all routes — tech_stack.md §4.5

### Phase 2 EXIT CRITERIA (workflow.md §4)
- [x] All 6 service pages + About + Pricing built & prerendering
- [ ] ⚠ Schema validated via Rich Results Test — **USER (needs deployed URL)**; JSON-LD present & well-formed in prerender (verified)
- [x] Internal linking between services/pricing/process working (verified in prerender)
- [x] Quality Gates §6: Content ✓ · Brand-restraint ✓ · Accessibility ✓ (CTA hover fixed) · Performance ⚠ (user measures)

---

## Phase 3 — Case Studies, Blog, SEO Content Engine

### Step 1 — Secure client permissions / case studies
- [ ] ⚠ Confirm 2–3 clients allow logos/specifics — **USER/client action** — workflow.md P3 S1
- [x] Build `/work` case-studies page (anonymized industry-tagged, before/after metrics) — prd.md §8.7

### Step 2 — Blog infrastructure
- [x] MDX via `@mdx-js/rollup` + remark-gfm/frontmatter — tech_stack.md §2 (NOT Next.js MDX)
- [x] `/blog` index + article template (`prose` tuned to design tokens, SPA-aware MDX links)
- [ ] RSS feed (optional — not built)
- [x] Article schema per post + FAQPage already on home/services/pricing — workflow.md P3 S2
- [x] /work + /blog + post slugs in sitemap + router (19 URLs)

### Step 3 — Content production (seo.md §6 calendar, in order)
- [x] "How much does QA outsourcing cost in 2026" (pricing/consideration)
- [x] "In-house vs outsourced QA: a founder's decision framework"
- [x] "Selenium vs Playwright vs Cypress in 2026"
- [x] "What a VAPT report should include before an ISO audit"
- [x] "Pre-launch QA checklist for SaaS startups"
- [x] "Setting up a Playwright + GitHub Actions pipeline"
- [x] Each article links to its relevant service page + "Book a Free QA Audit" CTA — seo.md §6

### Step 4 — Ongoing measurement loop (recurring, calendared)
- [ ] ⚠ Monthly Search Console keyword tracking — **USER (needs live site + GSC)** — seo.md §7
- [ ] ⚠ Monthly PageSpeed/CrUX review — **USER (needs live site)** — seo.md §7

### Phase 3 EXIT CRITERIA
- [x] /work + /blog built & prerendering, 6-article batch published
- [x] Quality Gates §6: Content ✓ · Brand-restraint ✓ (incl. MDX) · Accessibility ✓ · Performance ⚠ (user measures)

### Possible future optimization (noted, not blocking)
- [ ] Lazy-load blog post chunks (currently eager-globbed into router bundle, +~7KB gz on every page; minor vs 67KB react-router)
- [ ] Explicit woff2 preload-link injection (build-time, hashed names)

---

## Quality Gates (workflow.md §6) — RUN AT END OF EVERY PHASE

1. **Content gate** — Would this convince a skeptical CTO comparing 3 vendors, with zero animation/CSS?
2. **Performance gate** — Lighthouse mobile: LCP/CLS/INP against seo.md targets (actually run it).
3. **Accessibility gate** — Keyboard nav works · reduced-motion fallback verified · contrast checked (signal-500 green on paper-000 meets WCAG AA for its use; don't use green for body text if contrast insufficient).
4. **Brand-restraint gate** — Scan for any emoji, stock icon, or gradient blob that snuck back in. No decorative icons; numerals/typography/whitespace by default (design.md §6 icon policy).
