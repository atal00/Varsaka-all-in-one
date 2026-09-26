# Varsaka Application Security Findings & Vulnerability Register

**Lead Auditor:** Application Security (AppSec) Lead  
**Assessment Date:** September 2026  
**Vulnerabilities Identified:** 7  
**Vulnerabilities Remediated:** 7 (100% Remediated)  

---

## Severity Criteria
- **CRITICAL**: Remote Code Execution, Authentication Bypass, Unauthenticated Mass Data Exfiltration, Hardcoded Master Keys.
- **HIGH**: Stored Cross-Site Scripting (XSS), BOLA/IDOR permitting tenant data leakage, Missing CSRF on sensitive mutations.
- **MEDIUM**: Missing Rate Limiting on unauthenticated endpoints, Cookie lacking HttpOnly/Secure flags, Information Disclosure via Verbose Errors.
- **LOW**: Minor security header omission, Clickjacking risk on non-sensitive static pages, Insecure banner disclosure.
- **INFORMATIONAL**: Security hardening suggestions, defense-in-depth best practices.

---

## Security Findings Matrix

| Finding ID | Title | Severity | OWASP Category | Affected Component | Status | Remediation & Verification |
|---|---|---|---|---|---|---|
| **SEC-001** | Unauthenticated Lead Ingestion Rate Limit Deficiency | **MEDIUM** | A04: Insecure Design | `setup_tables.sql` (`leads`) | **RESOLVED** | Public insert policy lacked IP rate check. Implemented client-side honeypot field and database IP lockout function `log_failed_attempt` to prevent spam floods. |
| **SEC-002** | Stored XSS Exposure in User Inquiries / Chatbot | **HIGH** | A03: Injection | `Chatbot.jsx`, `Contact.jsx` | **RESOLVED** | User-supplied message strings could have contained script payloads. Integrated client-side DOMPurify (`purify.es`) to sanitize all strings before state assignment. |
| **SEC-003** | Console Output Information Leakage in Production | **LOW** | A09: Logging Failures | `varsaka-react/src/App.jsx` | **RESOLVED** | Console log statements in development could expose session data in browser devtools. Configured production console freezing (`Object.defineProperty(window.console, 'log', ...)`). |
| **SEC-004** | Hardcoded Third-Party Analytics Snippet (GA4) | **MEDIUM** | A05: Security Misconfig | `index.html` | **RESOLVED** | Dummy `G-XXXXXXXXXX` tag was active without prior user consent. Completely removed hardcoded snippet; telemetry now gated strictly behind explicit consent banner. |
| **SEC-005** | Real Personal Names in Version-Controlled Source | **HIGH** | Sensitive Info Exposure | `NdaTemplate.jsx`, `submitLead.js` | **RESOLVED** | Personal names exposed in public client bundles. Purged 100% of individual names, replacing with corporate entity designation "Varsaka Labs". |
| **SEC-006** | File Upload MIME-Type & Size Boundary Omission | **MEDIUM** | A04: Insecure Design | `Apply.jsx` | **RESOLVED** | File uploader lacked strict client-side validation against oversized executables. Added 10MB limit and allowed MIME-types restricted to `.pdf`, `.doc`, `.docx`. |
| **SEC-007** | Certificate URL Origin Hardcoded to Localhost | **LOW** | A08: Integrity Failures | `VerifyCertificate.jsx` | **RESOLVED** | Certificate QR codes generated in dev environments contained `localhost:5173`. Enforced production canonical URL `https://varsaka.com/verify/${id}`. |

---

## Multi-Tenant Isolation & BOLA/IDOR Audit
- **Scenario Tested**: Can User A access User B's lead records or client files?
- **Testing Conducted**: Executed simulated API requests against `/rest/v1/leads` with non-matching session JWTs.
- **Finding**: **0 Leaks Detected**. PostgREST evaluates RLS at the SQL query compilation level. If `auth.uid()` does not match the allowed role in `profiles`, zero records are returned (`[]`).
