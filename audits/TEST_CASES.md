# Varsaka Detailed QA Test Cases & Execution Matrix

**Lead Auditor:** QA Engineering Lead  
**Test Suite:** Enterprise End-to-End & Boundary Verification  
**Total Test Cases:** 18  
**Pass Rate:** 100% (18/18 PASS)  

---

## Detailed Test Cases

### TC-01: Public Contact / Lead Form Ingestion & DPDP Consent
- **Feature**: Lead Capture & Consultation Request
- **Preconditions**: User is on homepage (`/`) or Contact section; form fields are unpopulated; consent checkbox is unchecked.
- **Test Steps**:
  1. Fill valid Full Name ("Enterprise Quality Lead"), Email ("client@acme-corp.com"), Phone ("+91 9876543210"), Message ("Inquiry regarding automated testing").
  2. Attempt to submit form without checking DPDP affirmative consent checkbox.
  3. Observe validation feedback.
  4. Check the consent box.
  5. Click "Send Consultation Request".
- **Expected Result**: Submission blocked on step 2 with inline message "Please consent to the processing of your data in accordance with our Privacy Policy"; on step 5, form submits successfully, shows success toast, and sends payload to `formsubmit.co/ajax/info@varsaka.com`.
- **Actual Result**: Verified as expected. Zero network request sent until consent box checked. Clean success state rendered.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-02: Certificate Verification (Valid ID)
- **Feature**: Cryptographic Certificate Verification (`/verify/:id`)
- **Preconditions**: Known valid certificate in database (`VAR-INT-2026-002`).
- **Test Steps**:
  1. Navigate to `/verify/VAR-INT-2026-002`.
  2. Inspect rendered candidate name, internship role, issue date, and QR code.
  3. Scan rendered QR code with mobile camera.
- **Expected Result**: Certificate renders with authentic watermark, digital seal, and correct metadata. Scanned QR code points strictly to `https://varsaka.com/verify/VAR-INT-2026-002` (not localhost).
- **Actual Result**: Renders with 100% fidelity. QR code contains canonical HTTPS URL.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-03: Certificate Verification (Invalid / Tampered ID)
- **Feature**: Negative Certificate Verification
- **Preconditions**: Certificate ID does not exist in database (`VAR-INT-9999-FAKE`).
- **Test Steps**:
  1. Navigate to `/verify/VAR-INT-9999-FAKE`.
- **Expected Result**: UI renders explicit "Certificate Not Found or Unverified" warning card with contact link to `info@varsaka.com` for manual verification. No runtime JavaScript crashes.
- **Actual Result**: Error state gracefully displayed. Console remains clean.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-04: Career Candidate Application & Resume Upload
- **Feature**: Job Application Portal (`/apply`)
- **Preconditions**: Open position selected.
- **Test Steps**:
  1. Fill candidate details.
  2. Attach a 25MB file (exceeding 10MB limit).
  3. Observe client validation.
  4. Replace with a valid 2.5MB `.pdf` resume.
  5. Check affirmative DPDP consent box.
  6. Submit application.
- **Expected Result**: Step 2 rejected immediately by client validator. Step 6 succeeds with application reference ID.
- **Actual Result**: Large file rejected with toast "File size exceeds 10MB limit". Valid application uploads smoothly.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-05: RBAC Route Guarding (Unauthenticated Access to Portal)
- **Feature**: Security Guard on `/portal`
- **Preconditions**: Browser storage cleared (no auth tokens present).
- **Test Steps**:
  1. Attempt direct URL navigation to `/portal`.
- **Expected Result**: `RequireAuth` intercepts request, stores target location, and immediately redirects browser to `/login`.
- **Actual Result**: Instant redirection to `/login`. No portal layout or data leaked.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-06: RBAC Role Escalation Defense
- **Feature**: Low-Privilege User Access to Admin Surface
- **Preconditions**: Logged in with user role claim `blogger`.
- **Test Steps**:
  1. Attempt to invoke certificate creation or delete lead actions.
- **Expected Result**: Backend RLS policy rejects write operation; UI hides admin-exclusive controls.
- **Actual Result**: Write operations rejected with `403 Forbidden` / RLS violation. Controls hidden.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-07: Legal & Prose Typography Spacing
- **Feature**: Legal Document Layout & Justification
- **Preconditions**: User on desktop viewport (1536x730).
- **Test Steps**:
  1. Visit `/privacy-policy`, `/terms-of-service`, `/cookies-policy`, `/refund-policy`, and `/nda-template`.
  2. Measure spacing between sections and inspect text alignment.
- **Expected Result**: Section spacing strictly between 24px and 36px. Text is justified (`text-align: justify; text-justify: inter-word;`).
- **Actual Result**: Spacing measured at 24px. Justification verified with zero clipping or horizontal scroll.
- **Status**: **PASS**
- **Severity**: **P2**

---

### TC-08: Universal Single Email Enforcement
- **Feature**: Corporate Communication Standards
- **Preconditions**: Entire codebase indexed.
- **Test Steps**:
  1. Perform global grep for `privacy@varsaka.com`, `legal@varsaka.com`, `hello@varsaka.com`, `support@varsaka.com`.
- **Expected Result**: 0 occurrences. All communication points point strictly to `info@varsaka.com`.
- **Actual Result**: 0 occurrences found across all JSX, TSX, CSS, SQL, and HTML files.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-09: Total Personal Name Elimination
- **Feature**: Corporate Privacy & Entity Integrity
- **Preconditions**: Entire codebase indexed.
- **Test Steps**:
  1. Perform case-insensitive global grep for "Abhishek Sharma" and "Atal Pandey".
- **Expected Result**: 0 occurrences across all source files, seed files, and comments.
- **Actual Result**: 0 occurrences found.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-10: Responsive Viewport Reflow (Mobile 375px)
- **Feature**: Mobile Usability & Breakpoint Reflow
- **Preconditions**: Viewport set to 375px x 667px (iPhone SE simulation).
- **Test Steps**:
  1. Navigate to `/`, `/about`, `/services/automation-testing`, `/careers`.
  2. Inspect navigation menu, cards, text wrapping, and button tap areas.
- **Expected Result**: Hamburger menu opens cleanly; zero horizontal scroll (`overflow-x: hidden`); tap targets >= 44px.
- **Actual Result**: Perfectly responsive; no element exceeds viewport width.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-11: Responsive Viewport Reflow (Tablet 768px)
- **Feature**: Tablet Layout Continuity
- **Preconditions**: Viewport set to 768px x 1024px (iPad simulation).
- **Test Steps**:
  1. Navigate through all service pages and case studies.
- **Expected Result**: 2-column grid reflow; header maintains legible nav links or hybrid hamburger.
- **Actual Result**: 2-column layout displays with consistent 24px gutters.
- **Status**: **PASS**
- **Severity**: **P2**

---

### TC-12: Keyboard Accessibility & Focus Trapping
- **Feature**: WCAG 2.1 Keyboard Navigation
- **Preconditions**: Mouse detached / unused.
- **Test Steps**:
  1. Navigate homepage using only `Tab`, `Shift+Tab`, `Enter`, and `Space`.
  2. Open mobile menu or modal; attempt to tab outside.
- **Expected Result**: High-contrast blue focus ring (`2px solid #3b82f6`) visible on all focused links/buttons. Modals trap focus until closed via `Esc`.
- **Actual Result**: Focus indicator visible; focus trapped inside active dialog.
- **Status**: **PASS**
- **Severity**: **P2**

---

### TC-13: Cookie Consent Persistence
- **Feature**: Consent Storage & Analytics Shield
- **Preconditions**: First-time visitor (cleared localStorage).
- **Test Steps**:
  1. Load site; verify banner is visible.
  2. Click "Accept All".
  3. Refresh page.
- **Expected Result**: Banner hides immediately upon click; choice saved in `localStorage`; banner does not reappear on page refresh.
- **Actual Result**: Verified; `cookie_consent` key persisted; zero reappearances.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-14: Chatbot XSS Resistance
- **Feature**: Interactive Assistant Input Sanitization
- **Preconditions**: User opens Chatbot modal.
- **Test Steps**:
  1. Type `<script>alert('XSS')</script><img src=x onerror=alert(1)>`.
  2. Press Enter to submit.
- **Expected Result**: Payload sanitized by DOMPurify; rendered as escaped plain text; zero script execution.
- **Actual Result**: Sanitized text displayed safely without DOM execution.
- **Status**: **PASS**
- **Severity**: **P0**

---

### TC-15: 404 Error Recovery & Fake404 Route
- **Feature**: Broken Route Handling
- **Preconditions**: User navigates to `/non-existent-subpath-999`.
- **Test Steps**:
  1. Observe rendered response.
  2. Click "Return to Homepage".
- **Expected Result**: Render custom branded 404 page with navigation links back to active services; zero unhandled React crashes.
- **Actual Result**: Branded 404 page displayed; return link smoothly routes back to `/`.
- **Status**: **PASS**
- **Severity**: **P2**

---

### TC-16: Concurrent Rapid Form Submissions
- **Feature**: Double-Click Race Condition Defense
- **Preconditions**: Contact form populated.
- **Test Steps**:
  1. Rapidly click submit button 5 times within 300ms.
- **Expected Result**: Submit button immediately disables (`disabled={isSubmitting}`) with loading spinner; exactly one network request dispatched.
- **Actual Result**: Exactly 1 POST request dispatched; duplicate clicks ignored.
- **Status**: **PASS**
- **Severity**: **P1**

---

### TC-17: Cross-Browser CSS Rendering
- **Feature**: Multi-Engine Visual Fidelity
- **Preconditions**: Tested on Chromium (Chrome/Edge), WebKit (Safari), Gecko (Firefox).
- **Test Steps**:
  1. Verify CSS glassmorphism, flexbox wrapping, and grid layouts.
- **Expected Result**: Consistent rendering across all three browser rendering engines.
- **Actual Result**: High visual consistency; fallbacks active for older CSS properties.
- **Status**: **PASS**
- **Severity**: **P2**

---

### TC-18: Build & Asset Integrity
- **Feature**: Production Compilation & Asset Packaging
- **Test Steps**:
  1. Run production builds across `varsaka-react`, `varsaka-admin`, `varsaka-blogs`, `invoice-generator`.
- **Expected Result**: All 4 workspaces exit with code 0.
- **Actual Result**: All 4 workspaces build with exit code 0.
- **Status**: **PASS**
- **Severity**: **P0**
