# SEO Strategy — Varsaka Labs v2.0

## 1. Current State Assessment

Based on research of the live site content: Varsaka currently has decent on-page copy depth (FAQ content, service descriptions, testimonials) but the architecture is a **single dense homepage** with everything crammed in — this means there's no dedicated, deep page for any single high-intent keyword (e.g., "automation testing services," "VAPT testing company," "Playwright testing agency"). Google has nothing to rank for those specific intents except the homepage, which dilutes relevance for all of them simultaneously. (A prior internal SEO audit reportedly scored the old site ~52/100 — consistent with this diagnosis: solid copy, weak structure/technical foundation.)

Core fix in this redesign: **move from "one page trying to rank for everything" to "one homepage for brand + 6 service pages + pricing + about, each targeting a specific cluster of intent."**

## 2. Keyword Strategy

### 2.1 Primary clusters (one per service page)

| Page | Primary keyword | Supporting keywords |
|---|---|---|
| /services/functional-testing | functional testing services | manual QA testing company, functional test outsourcing |
| /services/automation-testing | test automation services | Selenium testing company, Playwright automation services, Cypress testing agency, automation testing outsourcing |
| /services/performance-testing | performance testing services | load testing company, JMeter testing services, stress testing software |
| /services/security-testing-vapt | VAPT testing company | penetration testing services, application security testing, web app pen test company |
| /services/ai-powered-qa | AI-powered QA services | AI test automation, self-healing test scripts, ML-based testing |
| /services/mobile-app-testing | mobile app testing company | iOS app testing services, Android testing outsourcing, cross-platform mobile QA |

### 2.2 Commercial-intent modifiers (apply across pages via title tags, H1 variants, FAQ schema)

"... company," "... services," "... agency," "... outsourcing," "... for startups," "QA testing company in India," "software testing partner for SaaS." These modifiers map directly to how buyers actually search when comparing vendors (consistent with how every competitor researched — QATestLab, Testriq, Cigniti, QA Mentor — titles their own pages).

### 2.3 Geographic/market angle (differentiator — competitors split between "US-based" and generic "global")

Varsaka's actual go-to-market (per existing context) spans India and Nepal pharmacy/SaaS network plus global startup clients. Recommend a clear, honest positioning line used consistently: **"India-based QA team, working with startups across India, Nepal, and globally."** This is more specific and more credible than "global QA services" (which every competitor claims identically) and supports location-relevant search intent ("software testing company India," "QA outsourcing India for startups") without overclaiming.

### 2.4 Comparison/consideration content (Phase 3 blog)

High commercial intent, low competition opportunity, because most competitor content here is thin or absent:
- "In-house QA vs outsourced QA: when does it make sense for a startup"
- "Selenium vs Playwright vs Cypress: which to choose in 2026"
- "What does a VAPT report actually need to include for an ISO audit"
- "How much does QA outsourcing cost in 2026" (directly answers the #1 unanswered buyer question — current site avoids numbers entirely, which is a missed SEO + conversion opportunity, addressed in prd.md pricing recommendation)
- "QA checklist before a SaaS product launch"

## 3. On-Page Technical Requirements

### 3.1 Title tag / meta description templates

```
Homepage: 
  Title: Varsaka Labs | Software QA & Testing Company for Startups
  Meta: Functional, automation, performance, security, and AI-powered QA 
        services for startups and SaaS teams. Book a free QA audit call.

Service page template:
  Title: {Service Name} Services | Varsaka Labs
  Meta: {One-sentence outcome statement specific to this service}. 
        Tools: {tool names}. Get a free audit — no obligation.
```

Avoid keyword-stuffed titles like "Best Software Testing Company | #1 QA Services | Top Testing Agency" — this pattern (visible across several competitor sites researched) reads as spammy to both users and increasingly to Google's quality systems. One clear keyword + brand name is sufficient.

### 3.2 Heading structure

- One H1 per page, matching primary keyword intent naturally (not forced exact-match).
- H2s for each major section, written for humans first (e.g., "How we approach automation testing" rather than "Automation Testing Services Benefits Features").
- FAQ content marked up with `FAQPage` schema (JSON-LD) — the current site already has strong FAQ copy; this is a low-effort, high-value addition for rich-result eligibility.

### 3.3 Structured data (schema.org JSON-LD)

- `Organization` schema on every page (name, logo, sameAs social links, founder if appropriate).
- `Service` schema on each service page (serviceType, provider, areaServed).
- `FAQPage` schema wherever FAQ accordion content exists.
- `BreadcrumbList` schema for the /services/* hierarchy.
- `Review`/`AggregateRating` schema **only** if testimonials are genuinely collected with consent/verifiability — do not fabricate review counts/ratings; this risks manual action penalties and is an explicit Google spam policy violation area.

### 3.4 URL structure

Clean, keyword-relevant, no parameters: `/services/automation-testing` not `/services?id=2`. Already reflected in the IA in prd.md.

### 3.5 Internal linking

- Homepage services-system section links to each dedicated service page (currently the entire site is one page with anchor links only — this redesign's multi-page IA directly fixes that).
- Each service page cross-links to 2-3 related services (e.g., Automation page links to Performance and Functional) and to the Pricing and Process pages.
- Footer includes a clean sitemap-style link block to all 6 service pages — helps crawlability and topical clustering signals.

## 4. Technical SEO / Core Web Vitals

Direct consequence of the animation-heavy design — this section is non-negotiable given the hero/scroll system in animation.md:

- **LCP target < 2.5s:** Hero text (the H1) must be the LCP element and must render immediately in its resting/final visual state — do not wait for GSAP/ScrollTrigger to paint it. Animation enhances already-visible content; it never gates first paint.
- **No render-blocking animation JS:** GSAP bundle loaded with `defer` or dynamically imported after `DOMContentLoaded`; critical CSS inlined for above-the-fold layout.
- **CLS target < 0.1:** Reserve explicit height for the pinned hero/services sections before JS executes (via CSS `min-height`, not JS-calculated height) so nothing jumps when ScrollTrigger initializes.
- **Image strategy:** If any real screenshots/photos are used (case studies section per design.md), serve as modern formats (WebP/AVIF) with explicit width/height attributes, lazy-loaded below the fold.
- **Font loading:** `font-display: swap` for Fraunces/Inter, preload the two critical font files used in the hero to avoid invisible-text flash.
- **Mobile-first indexing:** Given the explicit mobile fallback behavior defined in animation.md (no horizontal scroll-jacking on mobile), the mobile experience is content-equivalent to desktop — important because Google indexes the mobile version primarily; a mobile version that strips meaningful content (not just animation) would hurt rankings.

## 5. Local/Off-Page Signals

- Google Business Profile setup/claim if Varsaka has a registered office address (India) — supports "QA company near me" / location-qualified searches and builds entity trust.
- Clutch.co and GoodFirms profiles — every single competitor researched (QA Mentor, BetterQA, Testriq, AppSierra, DeviQA) maintains active profiles on these B2B review platforms; this is table-stakes for the category and a meaningful backlink + trust signal source that should not be skipped.
- LinkedIn company page kept active and linked via `sameAs` schema — relevant given B2B/founder-led outreach is already part of Varsaka's existing motion.

## 6. Content Calendar (Phase 3 — first 90 days post-blog-launch)

| Week | Article | Target intent |
|---|---|---|
| 1-2 | "How much does QA outsourcing cost in 2026" | Pricing/consideration |
| 3-4 | "In-house vs outsourced QA: a founder's decision framework" | Consideration |
| 5-6 | "Selenium vs Playwright vs Cypress in 2026" | Tool-research/automation cluster |
| 7-8 | "What a VAPT report should include before an ISO audit" | Security cluster, high-intent |
| 9-10 | "Pre-launch QA checklist for SaaS startups" | Functional/process cluster |
| 11-12 | "Setting up a Playwright + GitHub Actions pipeline: a practical guide" | Automation cluster, dev-audience link-bait |

Each article links back to its relevant service page (internal linking reinforcement) and includes a single consistent CTA block ("Book a Free QA Audit") matching the site-wide conversion principle from prd.md.

## 7. Measurement

- Google Search Console: track impressions/clicks per the keyword clusters in section 2, segmented by page.
- Target: 15+ non-brand keywords ranking in top 20 within 90 days (cross-referenced in prd.md success metrics).
- PageSpeed Insights / CrUX field data review monthly post-launch — given the animation-heavy hero, this is the single most important recurring check to ensure visual ambition never regresses real-user performance.
