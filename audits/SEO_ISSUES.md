# Varsaka Technical SEO Issues Register

**Lead Auditor:** Technical SEO Lead  
**Audit Date:** September 2026  
**Status Matrix:** Fixed (5) | Monitored (1)  

---

## Technical SEO Issue Register

| Issue ID | Priority | Subsystem / File | Description | Impact | Status | Fix Details / Resolution |
|---|---|---|---|---|---|---|
| **SEO-001** | **P0** | `varsaka-react/public/robots.txt` | Missing `Disallow` rules for `/portal`, `/login`, and `/verify/`. | Search bots were crawling internal client portal and alumni verification URLs. | **FIXED** | Added explicit `Disallow: /portal`, `Disallow: /login`, `Disallow: /404`, `Disallow: /verify/` in `robots.txt`. |
| **SEO-002** | **P1** | `varsaka-react/public/sitemap.xml` | Missing URLs for newly introduced compliance policies (`/cookies-policy`, `/refund-policy`). | Search engines delayed in discovering legal compliance disclosures. | **FIXED** | Injected `<url>` definitions with `priority 0.4` and current `lastmod` date in `sitemap.xml`. |
| **SEO-003** | **P1** | `varsaka-react/src/App.jsx` | Missing route alias `/terms-and-conditions` caused broken internal/external backlinks. | Broken backlink equity and 404 crawl errors. | **FIXED** | Added route alias in `App.jsx` pointing to `TermsOfService.jsx`. |
| **SEO-004** | **P2** | `varsaka-react/index.html` | Hardcoded dummy Google Analytics snippet (`G-XXXXXXXXXX`) firing on every page without consent. | Unconsented tracking warning and dummy data pollution in analytics. | **FIXED** | Removed dummy snippet; analytics initialization gated behind affirmative user consent. |
| **SEO-005** | **P2** | `varsaka-react/src/pages/Home.jsx` | Unsubstantiated superlative titles in hero banner ("#1 in the World"). | Potential algorithmic quality de-ranking for spammy promotional text. | **FIXED** | Replaced with verified engineering metrics ("99.8% Test Coverage Rate", "500K+ Automated Assertions"). |
| **SEO-006** | **P3** | `varsaka-react/public/og-image.png` | Open Graph image file size was 684 kB. | Slower preview card generation in social crawlers (LinkedIn, Twitter). | **MONITORED** | Recommended: Compress OG preview image to under 250 kB. |

---

## Technical SEO Sign-off
All P0 and P1 technical SEO issues have been resolved in the codebase and verified against standard search engine crawling specifications.
