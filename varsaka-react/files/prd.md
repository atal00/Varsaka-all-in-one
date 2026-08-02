# PRD — Varsaka Labs Website Redesign v2.0

## 1. Background

Varsaka Labs ki current website (varsaka.com) ek generic "SaaS template" structure follow karti hai — emoji bullets (✅), stock icons, gradient cards, generic copy patterns jo har dusri QA outsourcing company ki site mein dikhte hain (QATestLab, QualiTlabs, Testriq, Cigniti, QA Mentor, BetterQA — sab ka structure almost identical hai: hero → trust badges → service grid with icons → process steps → testimonials → FAQ → CTA). Yeh wahi reason hai jiski wajah se site "AI-generated" feel deti hai — koi visual signature nahi hai, koi original art direction nahi hai, sirf content blocks hain.

Goal: ek aisi site banani hai jo finance/institutional-grade trust communicate kare (jaise Tresmares Capital ki site karti hai — minimal, confident, scroll-driven storytelling, zero clutter) lekin Varsaka ke actual business (software QA/testing services) ke liye.

## 2. Problem Statement

1. Site dekhte hi "template" lagti hai — credibility kam hoti hai jab koi serious founder/CTO discovery call lene se pehle site dekhta hai.
2. Emoji aur generic icons (✅, 🚀, 🎁 jaise competitors use karte hain) ek "low-budget agency" signal dete hain — enterprise/fintech/healthcare clients ke liye yeh red flag hai.
3. Koi differentiation nahi hai content mein — "we test functional, automation, performance, security" — yeh exact line har competitor ki site pe milti hai.
4. CTA placement random hai — koi clear single conversion path nahi hai (book a call vs get quote vs contact — confusion).
5. SEO weak hai — generic keyword stuffing dikh rahi hai ("software testing company" repeat) without topical depth or structured content that actually ranks.
6. No visual proof of credibility — "trusted by 25+ clients in 4 months" line hai but koi logo wall, case study, ya number visualization nahi hai jo isko believable banaye.

## 3. Goals

- Naya site "boutique quality-engineering studio" jaisa lage — Tresmares-level confidence, par testing/QA domain mein.
- Ek single, strong CTA path: **"Book a Free QA Audit Call"** — har section isi decision की tarah point kare.
- Zero decorative emoji/icons jahan possible ho; jahan icon zaroori hai (service markers), wahan custom-drawn minimal line icons use karenge, stock/emoji nahi.
- Scroll-driven hero animation jo Varsaka ke core metaphor (bugs caught before they reach production / "quality gate") ko visually represent kare — Tresmares ke mountain-animation jaisa immersive lekin apne business se relevant.
- SEO architecture jo topical authority banaye (service-specific pages, comparison content, programmatic location pages for India/Nepal/global outsourcing intent).
- Page load aur Core Web Vitals enterprise-grade rahein — animation heavy hone ke bawजूद.

## 4. Non-Goals

- E-commerce / self-serve checkout nahi banayenge — yeh sales-assisted B2B service hai, lead-gen hi target hai.
- Multi-language site nahi (Phase 1 mein) — English-only, professional global tone (no Hinglish on the public site; client-facing tone needs to be neutral-international).
- Blog CMS build nahi karenge is phase mein — sirf service/landing pages aur SEO foundation; blog architecture sirf planning level pe seo.md mein cover hoga.
- Client portal / dashboard login nahi — yeh marketing site hai, product nahi.

## 5. Target Audience

| Persona | Description | What they care about |
|---|---|---|
| Startup Founder/CTO (Seed–Series B) | Tech-savvy, time-poor, evaluating 3-4 QA vendors in parallel | Speed of onboarding, proof via case studies/testimonials, transparent pricing model, tool-stack fit (their existing Jira/GitHub) |
| Engineering Manager at mid-size SaaS | Needs to "outsource" regression/automation pain without losing control | Process clarity, communication cadence, security/NDA posture, automation framework specifics (Selenium/Playwright/Cypress) |
| Healthcare/Fintech Compliance Lead | Needs VAPT, security testing, audit-ready reports | Certifications, CVSS-based reporting, ISO-aligned process, data handling policy |
| Pharma/Nepal wholesale network referral (StockMedix-adjacent) | Comes via KDO's existing network | Trust through relationship + visible competence, not cold-funnel content |

## 6. Competitive Landscape Summary

Researched: QATestLab, QualiTlabs, Testriq, Cigniti, QA Mentor, BetterQA, DeviQA, TestFort, AppSierra, QualityLogic.

Common pattern across all of them:
- Heavy use of checkmark emoji/icon bullets to list services.
- "Years of experience + number of projects + number of clients" stat bar near top.
- Generic photography or 3D-illustration stock assets.
- Testimonial carousels with no specificity (vague praise, no name/company in some cases).
- FAQ accordions at the bottom, same five questions almost everywhere (pricing model, onboarding time, tool integration, contract type, communication).
- Long service-category grids (Functional, Automation, Performance, Security, AI/ML, Mobile) presented as flat icon cards with zero narrative connecting them.

**Gap / opportunity for Varsaka:**
Nobody in this competitive set has invested in distinctive art direction or a flagship scroll-narrative homepage. Everyone competes on the same checklist of services with the same visual language. A site that reads like a confident, editorial, almost-finance-grade product (instead of "another QA vendor list") is a genuine differentiator — especially for higher-ticket clients (fintech, healthcare) who associate visual restraint with seriousness.

## 7. Information Architecture

```
/ (Home — full scroll narrative, single primary CTA)
/services
   /services/functional-testing
   /services/automation-testing
   /services/performance-testing
   /services/security-testing-vapt
   /services/ai-powered-qa
   /services/mobile-app-testing
/process            (how we work — the 4-step engagement model)
/work                (case studies / proof — replaces vague testimonial-only approach)
/about               (team, story, why Varsaka exists)
/pricing             (engagement models: fixed-price / retainer / T&M — transparent ranges where possible)
/contact             (book a call — calendar embed + short qualifying form)
/blog                (Phase 2 — SEO content hub, structure defined in seo.md)
```

Rationale: current site cram karta hai sab kuch ek single page mein (services, process, testimonials, FAQ — sab home pe). Naya structure home ko a *narrative trailer* banata hai (emotionally/visually convincing in under 90 seconds of scroll) and pushes deep information to dedicated pages — yeh SEO ke liye bhi better hai (topical depth per service) aur UX ke liye bhi (home halka rehta hai, fast).

## 8. Homepage Section-by-Section Spec

1. **Hero — "The Quality Gate"**
   Full-viewport scroll-pinned animation (detailed in animation.md). Headline communicates the one thing Varsaka does: catches what would've broken in production, before it ships. No stock photo, no emoji. Primary CTA appears after first scroll-trigger: "Book a Free QA Audit".

2. **Proof Bar**
   Numbers only, no badges/logos that look stocky unless real client logos are available (ask client for actual logos before launch — placeholder text-only stat strip until then): clients served, average regression-time reduction, critical bugs caught pre-launch. Each number animates in (count-up) on scroll-enter.

3. **The Problem (Narrative section)**
   Short, confident copy: what happens when teams ship without proper QA (a controlled, factual framing — not fear-mongering). This section earns the right to pitch the solution next. Replaces the generic "services grid" opener.

4. **Services — presented as a connected system, not a flat grid**
   Functional → Automation → Performance → Security → AI-powered → Mobile. Each rendered as a horizontal scroll-linked sequence (own panel, own micro-animation, own one-line outcome statement) rather than six identical icon-cards. Secondary CTA per service: "See how we approach [X] →" linking to that service's dedicated page.

5. **How We Work (Process)**
   4 steps from the current site (Discover → Plan & Build → Execute & Report → Support post-launch) redesigned as a connected horizontal timeline with scroll-progress indicator, not stacked cards.

6. **Why Varsaka (Differentiators)**
   Reframed from the current six icon-points into 3 stronger, specific claims (avoid generic claims like "we genuinely care"): tool-stack-native integration, transparent fixed/retainer pricing with real estimate post-discovery, and security/NDA posture for regulated industries.

7. **Proof / Case Highlights**
   Replace generic testimonial carousel with 2-3 specific, detailed mini case studies (the three real quotes already on the current site are good raw material — payment-flow bug catch, Playwright suite cutting regression from 6h to 45min, VAPT before ISO audit). Present as short narrative cards with concrete before/after numbers, not just quote blocks.

8. **FAQ**
   Keep — but tighten copy, remove redundant questions, make sure answers are specific (they already are reasonably specific on the current site; preserve that).

9. **Final CTA**
   Single, unambiguous: "Book a Free 30-Minute QA Audit." Calendar embed inline (Cal.com/Calendly style) instead of a generic "contact us" form-only block, to reduce friction.

## 9. Content Requirements

- Hero headline + subheadline: needs final copywriting pass — to be drafted referencing the existing taglines ("ship bug-free software", "total confidence") but rewritten with more specificity and less generic SaaS phrasing.
- Each service page needs: what we test, tools used, typical engagement length, sample deliverable (e.g., sample automation framework structure, sample VAPT report excerpt — anonymized).
- Case study content: needs real client permission to publish logos/specifics; until then, anonymized industry-tagged case studies ("Series A fintech, India") are acceptable.
- Pricing page: ranges or starting-from figures are strongly recommended for SEO + buyer trust (e.g., "Fixed-price regression cycles starting at ₹X" or "$X") — current site avoids all numbers, which increases bounce for price-sensitive buyers comparing vendors.

## 10. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Discovery call bookings via site | 2x current baseline |
| Avg. session duration on homepage | +40% vs current (scroll-driven engagement) |
| Bounce rate on homepage | Reduce by 25% |
| Organic non-brand keyword rankings (top 20) | 15+ keywords within 90 days (see seo.md for target list) |
| Core Web Vitals (mobile) | All "Good" — LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| Time-to-first-CTA-visible | Under 4 seconds even with hero animation |

## 11. Constraints & Risks

- **Risk:** Heavy scroll animation can hurt performance/SEO if not engineered carefully (canvas/SVG done wrong tanks LCP). Mitigation detailed in animation.md (lazy-mount, reduced-motion fallback, lightweight SVG not video/Lottie-bloat).
- **Risk:** No real client logos yet for social proof — placeholder strategy needed (text-based stat bar, anonymized case studies) until permission obtained.
- **Constraint:** Single-founder/developer build — scope must be phaseable. Phase 1 = Home + 1 flagship service page + Contact. Phase 2 = remaining service pages + Work + Pricing. Phase 3 = Blog/SEO content engine.
- **Risk:** Over-indexing on "looking different" at cost of clarity — every animated section must still load-bearing communicate information, not just look impressive (lesson from Awwwards-style sites that score high on design but can hurt usability/content scores — Tresmares itself scored only 7.03/10 on usability per jury, lower than its design score of 7.3, showing impressive visuals genuinely cost usability if not careful).

## 12. Phasing / Roadmap

- **Phase 1 (Week 1-2):** Homepage rebuild with hero animation, proof bar, services-as-system section, process, CTA. Contact page with calendar embed.
- **Phase 2 (Week 3-4):** Individual service pages (6), About page, Pricing page with transparent ranges.
- **Phase 3 (Week 5+):** Work/case-studies page (pending client permissions), Blog architecture + first 10 SEO articles per seo.md content map.

## 13. Approval Checklist Before Build

- [ ] Final hero headline/subheadline copy locked
- [ ] Real client logos/permissions confirmed or placeholder approach approved
- [ ] Color system + typography approved (see design.md)
- [ ] Animation concept approved (see animation.md)
- [ ] Pricing transparency level decided (ranges vs "contact us")
