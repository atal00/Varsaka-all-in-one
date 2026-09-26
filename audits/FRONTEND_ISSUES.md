# Varsaka Frontend Engineering Issues Register

**Lead Auditor:** Senior Frontend Engineering Lead  
**Audit Date:** September 2026  
**Classification Guide:**  
- **P0 – Production Blocker**: System unusable, security hole, compilation failure, or critical legal non-compliance.
- **P1 – Critical**: Core functional breakdown, memory leak, or broken key user journey.
- **P2 – Important**: Performance bottleneck, sub-optimal error recovery, or missing fallback state.
- **P3 – Improvement**: Refactoring, minor dead code cleanup, or cosmetic code style refinement.

---

## Detailed Issue Tracking Table

| Issue ID | Priority | Subsystem / File | Description | Impact | Status | Fix Details / Verification |
|---|---|---|---|---|---|---|
| **FE-001** | **P0** | `varsaka-blogs/package.json` | Next.js 16.2.9 Turbopack build failed due to Google Font replacer bug on multiple weights of `Newsreader`. | Production build was failing with code 1. | **FIXED** | Configured `next build --webpack` in build script, allowing clean compilation of all 11 static routes. |
| **FE-002** | **P0** | `varsaka-react/src/App.jsx` | Unregistered `/terms-and-conditions` route caused broken navigation for external links and regulatory references. | 404 page rendered on clicking terms links. | **FIXED** | Added route alias `<Route path="/terms-and-conditions" element={<><Navbar /><TermsOfService /><Footer /></>} />`. |
| **FE-003** | **P0** | `varsaka-react/src/components/ConsentBanner.jsx` | Google Analytics tag was initialized prior to user consent, violating e-Privacy and DPDP Act provisions. | Non-compliant cookie placement. | **FIXED** | Purged hardcoded `G-XXXXXXXXXX` tag from `index.html`; consent banner requires explicit click before activation. |
| **FE-004** | **P1** | `varsaka-react/src/contexts/AuthContext.jsx` | Potential memory leak if `supabase.auth.onAuthStateChange` listener was not cleaned up during fast re-renders. | Dangling subscription listeners in browser memory. | **FIXED** | Added explicit `data.subscription.unsubscribe()` inside `useEffect` cleanup return. |
| **FE-005** | **P1** | `varsaka-react/src/pages/VerifyCertificate.jsx` | QR code generation used `http://localhost:5173` if generated on local developer instance, breaking scanned certificates. | Scanned physical certificates showed 404 / localhost. | **FIXED** | Enforced production canonical URL `https://varsaka.com/verify/${id}` regardless of local origin. |
| **FE-006** | **P2** | `varsaka-admin/src/App.jsx` | Vite warned about ineffective dynamic imports for `Login.jsx` and `Fake404.jsx` due to static imports in `TimeBasedLogin.jsx`. | Redundant chunk overhead during build. | **FIXED** | Consolidated imports in `TimeBasedLogin.jsx` to respect code-splitting chunk boundaries. |
| **FE-007** | **P2** | `varsaka-react/src/pages/Apply.jsx` | Large file uploads (>10MB) would silently fail if FormSubmit/Supabase rejected the payload. | Candidate experienced hanging spinner without clear error feedback. | **FIXED** | Added client-side file size and MIME-type validation before initiating network request. |
| **FE-008** | **P3** | `varsaka-react/src/pages/Portal.jsx` | Multiple legacy console.log statements left in portal table filtering callbacks. | Potential minor performance degradation during rapid table search. | **FIXED** | Cleaned up debugging logs; production build automatically freezes console methods. |
| **FE-009** | **P3** | `varsaka-react/src/index.css` | Redundant CSS reset rules duplicating Tailwind core preflight definitions. | Minor CSS payload bloat (2.1 kB). | **FIXED** | Streamlined CSS reset; purged duplicate typography tokens. |

---

## Status Assessment
All P0 and P1 frontend issues have been remediated in the codebase and verified via production builds across all 4 projects.
