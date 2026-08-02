# Workflow — Varsaka Labs Redesign Build Plan

## 1. Purpose

Yeh document batata hai **kis order mein** build karna hai — taaki ek single founder-developer (KDO) bina overwhelm hue, step-by-step execute kar sake. PRD, design, animation aur SEO docs already define **what** banana hai; yeh file define karti hai **kis sequence mein** aur **kis tarah verify** karna hai har step ke baad.

## 2. Recommended Stack

Given existing project context (Next.js already used for StockMedix, Telavin) — consistency recommended:

- **Framework:** Next.js (App Router) — SSR/SSG for SEO benefit (matches seo.md technical requirements directly: fast LCP, crawlable content without JS-dependency for core text).
- **Animation:** GSAP + ScrollTrigger (matches animation.md spec exactly, same stack as the Tresmares reference).
- **Styling:** Tailwind CSS for utility/layout speed + CSS custom properties for the design-token system (design.md color/type variables map directly to CSS vars).
- **CMS for blog (Phase 3 only):** Not needed for Phase 1/2 — keep blog as MDX files in-repo until volume justifies a headless CMS.
- **Hosting:** Vercel (native Next.js fit, easy preview deployments per PR — useful for showing client/self progress).
- **Forms/Calendar:** Cal.com embed (open-source, self-hostable later if needed) for the Contact page booking flow.

## 3. Phase 1 — Foundation + Homepage (Week 1-2)

### Step 1: Design tokens setup
- Implement design.md's color variables, typography scale, spacing system as Tailwind config + CSS custom properties.
- Build a tiny internal style-reference page (`/dev/styleguide`, not linked publicly) showing all tokens, type scale, button states — sanity-check before building real pages. This catches inconsistency early instead of after 6 pages are built.

### Step 2: Static layout shells (no animation yet)
- Build homepage section-by-section in plain HTML/Tailwind first, fully static, correct content, correct spacing/typography — *no GSAP yet*.
- Why this order: get content/IA/copy right and reviewable before adding animation complexity on top. Animating wrong content wastes time twice.
- Verify: does the static page read well and convince, even with zero motion? If not, fix copy/layout before touching animation — motion can't save weak content (this is also why prd.md content requirements section exists; lock copy here).

### Step 3: Hero animation build
- Implement the "Quality Gate" node-grid SVG per animation.md section 2.
- Build in isolation first (a standalone test route, e.g., `/dev/hero-test`) before wiring into the real homepage — easier to iterate on scroll-scrub timing without affecting the rest of the page.
- Checklist before merging into homepage: reduced-motion fallback works, mobile node-count reduction applied, no layout shift on load, hero text is visible/readable even at progress=0 (a crawler/JS-disabled visitor must still see the H1 immediately).

### Step 4: Services-system scroll section
- Build desktop pinned-panel version first, verify scroll-scrub feels calm (per design.md easing spec) not jarring.
- Build mobile vertical-stack fallback — test that it's NOT just "the desktop version squeezed," but genuinely the simpler fade-stack pattern per animation.md section 3.

### Step 5: Remaining homepage sections
- Proof bar (count-up), Process timeline, Differentiators, Case studies, FAQ, Final CTA — in that order, each verified independently against design.md component spec before moving to the next.

### Step 6: Performance pass (mandatory before calling Phase 1 done)
- Run Lighthouse/PageSpeed on the built homepage — both mobile and desktop.
- Verify against seo.md Core Web Vitals targets (LCP < 2.5s, INP < 200ms, CLS < 0.1) explicitly — do not skip this and assume "it feels fast." Measure it.
- If failing: most likely culprits are unoptimized fonts (check `font-display: swap` + preload), GSAP loading too early/blocking, or missing reserved-height on pinned sections (causing CLS) — check these three first per animation.md section 6.

### Step 7: Contact page + Cal.com embed
- Simple page, calendar embed, short qualifying form (company name, what you're testing, rough timeline) — keep friction minimal per prd.md goal of single clear conversion path.

**Phase 1 exit criteria:** Homepage + Contact live, passes Core Web Vitals targets, reduced-motion fallback verified, mobile experience tested on a real mid-tier device (not just desktop devtools emulation — animation.md explicitly flags this).

## 4. Phase 2 — Service Pages, About, Pricing (Week 3-4)

### Step 1: Build one service page fully (e.g., Automation Testing) as the template
- This becomes the reusable template for the other 5 — solving layout/component questions once instead of six times.
- Include: hero mini-section (smaller scale version of homepage hero language, no full scroll-pin needed here — keep service pages lighter-weight than homepage), what-we-test content, tools-used section, typical engagement length, sample deliverable mention, FAQ specific to this service, CTA.

### Step 2: Replicate template for remaining 5 services
- Functional, Performance, Security/VAPT, AI-Powered QA, Mobile — content per prd.md section 9 content requirements.
- Apply seo.md keyword/meta templates per page during this step, not after — easier to write content with the target keyword in mind from the start than retrofit later.

### Step 3: About page
- Founder story, why Varsaka exists, team (even if small — authenticity over fake "50+ employees" claims that competitors sometimes imply).

### Step 4: Pricing page
- Per prd.md recommendation: include actual starting-from ranges or clear engagement-model explanation (fixed-price vs retainer vs T&M) — avoid the all-competitors pattern of zero pricing transparency, which is a real differentiation opportunity identified in research.

### Step 5: Schema markup pass
- Add Organization, Service, FAQPage, BreadcrumbList JSON-LD per seo.md section 3.3 — do this once all pages exist, in a single dedicated pass, easier to verify consistency across all pages at once via Google's Rich Results Test tool.

**Phase 2 exit criteria:** All 6 service pages + About + Pricing live, schema validated via Rich Results Test, internal linking between services/pricing/process confirmed working.

## 5. Phase 3 — Case Studies, Blog, SEO Content Engine (Week 5+)

### Step 1: Secure client permissions
- Before building the /work case-studies page, confirm with at least 2-3 existing clients whether logos/specifics can be published. If not yet possible, ship anonymized industry-tagged versions (per prd.md section 8.7) — don't block the page launch on permission delays indefinitely.

### Step 2: Blog infrastructure
- MDX-based blog within Next.js (per stack decision in section 2) — set up the route, a simple article template matching design.md typography, RSS feed (optional but cheap), and the FAQPage/Article schema pattern.

### Step 3: Content production
- Follow seo.md section 6 content calendar in order — pricing/consideration content first (highest buyer-intent value), tool-comparison content next, then process/checklist content.

### Step 4: Ongoing measurement loop
- Monthly: Search Console keyword tracking + PageSpeed/CrUX review (per seo.md section 7) — this is a recurring task, not a one-time launch checklist item, and should be calendared.

## 6. Quality Gates (apply at the end of every phase, not just at final launch)

1. **Content gate:** Would this page convince a skeptical CTO comparing 3 vendors, even with zero animation? (Read it with animation/CSS disabled mentally.)
2. **Performance gate:** Lighthouse mobile score check — specifically LCP/CLS/INP against seo.md targets.
3. **Accessibility gate:** Keyboard navigation works, reduced-motion fallback verified, color contrast checked (especially signal-500 green on paper-000 background — verify it meets WCAG AA for text use, and avoid using it for body text if contrast is insufficient; reserve it for large UI elements like buttons where contrast requirements are more lenient).
4. **Brand-restraint gate:** Scan the page for any emoji, stock icon, or gradient blob that snuck back in during fast iteration — easy to accidentally regress toward "templated" under time pressure; this is the recurring discipline check tied directly back to the original problem statement in prd.md.

## 7. Suggested Tooling for KDO's Workflow

Given KDO's existing toolchain across other projects (Claude Code usage, GitHub-based workflow):
- Use Claude Code for the actual component/page implementation once these 5 docs are approved — feed it design.md + animation.md directly as context per component being built, rather than re-explaining the system each time.
- Keep a single `CHANGELOG.md` or use GitHub PR descriptions per phase-step above, so progress against this workflow doc is traceable.
- Vercel preview deployments per PR/branch — share preview links for self-review against the quality gates in section 6 before merging to production.
