# Tech Stack — Varsaka Labs Redesign (React)

## 1. Why This File Exists

`workflow.md` mein originally Next.js suggest kiya gaya tha (SSR/SEO benefit ke liye). Yeh file us decision ko **override** karti hai — final call hai ki site **plain React (Vite-based)** pe build hogi, koi Next.js/SSR framework nahi. Build prompt aur Claude Code dono ko isi file ko authoritative maanna hai stack ke liye, `workflow.md` section 2 ki jagah.

## 2. Final Stack

```
Framework:        React 18+ (Vite as the build tool — fast dev server, minimal config)
Routing:          React Router v6 (client-side routing for / , /services/*, /about, /pricing, /contact)
Animation:        GSAP + ScrollTrigger (no change — exactly as animation.md spec requires)
Styling:          Tailwind CSS + CSS custom properties (no change — exactly as design.md spec requires)
Forms/Calendar:    Cal.com embed (no change — same as before)
Hosting:          Vercel or Netlify (both support static React/Vite builds with zero config)
Blog (Phase 3):    MDX files rendered via a Vite MDX plugin (vite-plugin-mdx or @mdx-js/rollup), 
                   no headless CMS needed at this stage
```

## 3. Why React (Vite) Instead of Next.js — Trade-offs to Be Aware Of

Being upfront about what changes when we drop SSR, since `seo.md` was written assuming server-rendered HTML:

- **SEO impact:** A plain client-side React app renders content via JavaScript in the browser. Google's crawler does execute JS and can index client-rendered content, but it's slower/less reliable than getting fully-formed HTML on the first response. This matters directly for `seo.md`'s targets — mitigation steps below are now mandatory, not optional.
- **Core Web Vitals impact:** LCP (per seo.md target < 2.5s) is harder to hit with a pure client-rendered app because the browser must download JS, parse it, execute it, and only then paint the hero — versus a server-rendered page where the HTML (including the hero H1) arrives already painted. This is the single biggest reason Next.js was originally recommended; building in plain React means we have to work harder in other ways to hit the same target.
- **Upside:** Simpler mental model, smaller learning surface, faster local dev iteration, no server runtime to manage/deploy — purely static files served from a CDN. Given this is a single founder-developer project, that simplicity is a real, legitimate reason to choose this path.

## 4. Mandatory Mitigations (to protect seo.md targets despite no SSR)

Since we're accepting the SEO/CWV trade-off above, these steps are not optional — they are how we keep `seo.md`'s Core Web Vitals targets achievable on a client-rendered React app:

1. **Static prerendering for crawlability.** Use `vite-plugin-ssg` or a prerender step (e.g., `vite-plugin-prerender-spa` or running the build through Puppeteer/`react-snap` once) so that each route (`/`, `/services/automation-testing`, etc.) ships actual pre-rendered HTML with the real content in it — not an empty `<div id="root">`. This is the closest equivalent to SSR's SEO benefit without adopting a server framework. This single step matters more than any other for protecting `seo.md`'s ranking goals.
2. **Hero H1 must exist in the prerendered HTML immediately**, exactly per `animation.md` section 6 — the resting-state headline text is real DOM content from first paint, GSAP only enhances it after. This was already a requirement in `animation.md`; it becomes even more critical without SSR.
3. **Code-split GSAP and route bundles.** Use React.lazy + dynamic imports per route so the homepage doesn't load the bundle weight of service-page code, and vice versa. Keeps initial JS payload (and therefore LCP/INP) lean.
4. **Meta tags per route via `react-helmet-async` (or similar).** Since there's no server to set `<title>`/meta dynamically per request, this library updates `<head>` tags client-side per route — combine with the prerendering step above so crawlers see correct per-page titles/descriptions/schema in the actual prerendered HTML, not just after JS runs.
5. **Sitemap.xml generated at build time** (a small Node script run as part of the build, listing all static routes) — since there's no server to generate it on request, it must be a build artifact.
6. **Inline critical CSS + font preload**, same as `seo.md` section 4 already specifies — this doesn't change with React vs Next.js, still required either way.

## 5. Project Structure

```
/src
  /components       (Nav, Footer, Button, FAQAccordion, CountUpStat, etc. — per design.md component inventory)
  /sections          (HomeHero, ServicesSystem, ProcessTimeline, ProofBar, CaseStudies, FinalCTA)
  /pages             (Home, ServicePage, About, Pricing, Contact — one ServicePage template, content-driven)
  /content           (service page content as data — JSON or TS objects — one file per service, 
                       so the 6 service pages stay template + data, not 6 duplicated page files)
  /styles            (tailwind.css, design tokens as CSS custom properties per design.md)
  /animations        (gsap setup, ScrollTrigger registration, the node-grid hero animation logic, 
                       isolated from components so it can be unit-tested/iterated independently)
  /hooks             (usePrefersReducedMotion, useScrollProgress — reusable across sections)
/scripts
  generate-sitemap.js   (build-time sitemap.xml generation, per section 4 point 5 above)
/public
  (static assets, favicon, og-image, robots.txt)
```

## 6. Routing Map (React Router)

```jsx
<Route path="/" element={<Home />} />
<Route path="/services/functional-testing" element={<ServicePage data={functionalData} />} />
<Route path="/services/automation-testing" element={<ServicePage data={automationData} />} />
<Route path="/services/performance-testing" element={<ServicePage data={performanceData} />} />
<Route path="/services/security-testing-vapt" element={<ServicePage data={securityData} />} />
<Route path="/services/ai-powered-qa" element={<ServicePage data={aiQaData} />} />
<Route path="/services/mobile-app-testing" element={<ServicePage data={mobileData} />} />
<Route path="/process" element={<Process />} />
<Route path="/about" element={<About />} />
<Route path="/pricing" element={<Pricing />} />
<Route path="/contact" element={<Contact />} />
{/* /work and /blog added in Phase 3 per workflow.md */}
```

One `ServicePage` component + per-service data file (per section 5 structure) — avoids duplicating layout code six times, matches `workflow.md` Phase 2 Step 1's "build one template, replicate" approach exactly, just expressed as a React pattern instead of six separate page files.

## 7. Dependencies (initial install list)

```bash
npm create vite@latest varsaka-site -- --template react
cd varsaka-site
npm install react-router-dom gsap react-helmet-async
npm install -D tailwindcss postcss autoprefixer
npm install -D vite-plugin-prerender-spa   # or chosen prerender solution per section 4.1
npx tailwindcss init -p
```

## 8. What Does NOT Change

Everything else stays exactly as already specified — this file only replaces the framework choice:

- `design.md` — fully unchanged (Tailwind config + CSS vars implement it identically in React or Next.js).
- `animation.md` — fully unchanged (GSAP/ScrollTrigger code is framework-agnostic, just wrapped in a `useEffect`/custom hook instead of a Next.js-specific pattern).
- `seo.md` — unchanged as the *target*, but section 4 of this file adds the *how* needed to still hit those targets without SSR.
- `workflow.md` — phase sequence and quality gates unchanged. Only Section 2 ("Recommended Stack") of `workflow.md` is superseded by this file.

## 9. Update Needed in build-prompt.md

When feeding the build prompt to Claude Code, add one line near the top pointing to this file as the authoritative stack decision, e.g.:

> "Stack note: ignore `workflow.md` section 2's Next.js suggestion — the final decision is in `tech_stack.md`. Build on React + Vite as specified there, including the prerendering mitigation steps, since we're not using SSR."
