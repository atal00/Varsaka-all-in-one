# Varsaka Formal Bug Report & Defect Log

**Lead Auditor:** QA Engineering Lead  
**Test Cycle:** Production Readiness Cycle 2026.Q3  
**Defects Tracked:** 8  
**Defects Resolved & Verified:** 8 (100% Closure Rate)  

---

## Defect Summary by Severity

| Severity Level | Definition | Open | Resolved | Total |
|---|---|---|---|---|
| **P0** | Blocker / Security / Compilation / Legal Compliance | 0 | 4 | 4 |
| **P1** | Critical Functional Breakdown | 0 | 2 | 2 |
| **P2** | Major Usability / Spacing Defect | 0 | 2 | 2 |
| **P3** | Minor Issue / Typo | 0 | 0 | 0 |
| **P4** | Cosmetic Enhancement | 0 | 0 | 0 |

---

## Detailed Defect Entries

### BUG-001 (Severity: P0) - Next.js Turbopack Font Replacer Build Crash
- **Affected Project**: `varsaka-blogs`
- **Description**: Next.js 16.2.9 failed production compilation with code 1 due to Turbopack font replacer failing on multi-weight `Newsreader` font imports.
- **Root Cause**: Turbopack AST parser bug in Next 16 font submodule when multiple weights and italic styles are defined on Google serif fonts.
- **Remediation**: Configured `next build --webpack` in `varsaka-blogs/package.json`.
- **Status**: **VERIFIED FIXED** (Exit code 0, 11 static pages generated).

---

### BUG-002 (Severity: P0) - Missing Affirmative Consent in Lead Collection
- **Affected Project**: `varsaka-react` (`Contact.jsx`, `Apply.jsx`)
- **Description**: Contact and career application forms collected personal identifiers (name, email, phone) without explicit un-ticked affirmative consent, in violation of Section 6 of India's Digital Personal Data Protection Act (DPDP Act 2023).
- **Root Cause**: Forms lacked consent checkbox inputs.
- **Remediation**: Inserted required, unchecked-by-default consent checkboxes citing DPDP Act 2023 with direct links to the Privacy Policy. Submissions are rejected on client and API layers if unchecked.
- **Status**: **VERIFIED FIXED** (Form submission blocked until consent granted).

---

### BUG-003 (Severity: P0) - Individual Real Names Present in Source Code & Seed Data
- **Affected Project**: `varsaka-react`, `varsaka-admin`, `seed_data.sql`
- **Description**: Real individual names ("Abhishek Sharma", "Atal Pandey") were present in `NdaTemplate.jsx`, `Portal.jsx`, `submitLead.js`, and database seed files, violating corporate naming and privacy directives.
- **Root Cause**: Unvetted placeholder names and mock data from early prototypes.
- **Remediation**: Full repository sweep and purge. Replaced all occurrences with institutional corporate designations ("Varsaka Labs / Authorized Signatory").
- **Status**: **VERIFIED FIXED** (Global grep returns 0 hits).

---

### BUG-004 (Severity: P0) - Hardcoded Localhost Origin in Scanned QR Codes
- **Affected Project**: `varsaka-react` (`VerifyCertificate.jsx`)
- **Description**: Verification QR codes on issued internship certificates pointed to `http://localhost:5173` instead of the public production domain `varsaka.com`. Scanned physical prints threw 404/connection errors.
- **Root Cause**: `window.location.origin` was evaluated during local test generation and stored as static URL.
- **Remediation**: Hardcoded canonical HTTPS production URL `https://varsaka.com/verify/${certificate_id}` into QR generation algorithm.
- **Status**: **VERIFIED FIXED** (Scanned QR resolves to `varsaka.com`).

---

### BUG-005 (Severity: P1) - Excessive 200px+ Vertical Whitespace Between Legal Sections
- **Affected Project**: `varsaka-react` (`PrivacyPolicy.jsx`, `TermsOfService.jsx`, `NdaTemplate.jsx`)
- **Description**: Legal and terms pages had 192px-230px empty vertical gaps between headings and paragraphs, making documents appear disjointed and unreadable.
- **Root Cause**: Global CSS reset defined `section { padding: 96px 5%; }`. Multiple consecutive `<section>` tags inside `.prose-block` stacked 96px top + 96px bottom padding.
- **Remediation**: Added `.prose-block section { padding: 0 !important; margin: 0 0 1.45rem 0 !important; }` in `varsaka-react/src/index.css`.
- **Status**: **VERIFIED FIXED** (Visual measurement confirms tight 24px section margins).

---

### BUG-006 (Severity: P1) - Fragmented Support & Privacy Email Aliases
- **Affected Project**: `varsaka-react`, `varsaka-admin`
- **Description**: Documents and footers referenced `privacy@varsaka.com`, `legal@varsaka.com`, and `hello@varsaka.com`, which were non-existent inboxes, leading to bounced client emails.
- **Root Cause**: Ad-hoc email conventions created during page drafting.
- **Remediation**: Standardized every single contact, privacy, legal, and operational reference to `info@varsaka.com`.
- **Status**: **VERIFIED FIXED** (100% of contact points use `info@varsaka.com`).

---

### BUG-007 (Severity: P2) - Ragged Text Edges in Long-Form Legal & Technical Documents
- **Affected Project**: `varsaka-react`
- **Description**: Long paragraphs in Privacy Policy, Terms, and Service overviews displayed un-justified left-aligned text with irregular line endings on wide monitors.
- **Root Cause**: Missing typography justification CSS properties.
- **Remediation**: Added `text-align: justify; text-justify: inter-word; hyphens: auto; line-height: 1.68;` across all prose blocks.
- **Status**: **VERIFIED FIXED** (Text justified with clean bilateral margins).

---

### BUG-008 (Severity: P2) - Missing Route Alias for Terms and Conditions
- **Affected Project**: `varsaka-react` (`App.jsx`)
- **Description**: Links attempting to access `/terms-and-conditions` received 404 error because the internal route was strictly named `/terms-of-service`.
- **Root Cause**: Lack of route aliasing.
- **Remediation**: Registered `<Route path="/terms-and-conditions" element={<><Navbar /><TermsOfService /><Footer /></>} />` in `App.jsx`.
- **Status**: **VERIFIED FIXED** (Both URLs render correctly).
