# Varsaka Privacy & Data Protection Issues Register

**Lead Auditor:** Privacy and Data Protection Lead  
**Assessment Date:** September 2026  
**Status Matrix:** Remediated (6) | Monitored (1)  

---

## Privacy Issues Matrix

| Issue ID | Severity | Category | Description | Privacy Impact | Status | Remediated Action / Verification | Legal Review Required |
|---|---|---|---|---|---|---|---|
| **PRV-001** | **CRITICAL** | Consent & Notice | Contact and career forms collected personal data without an explicit affirmative consent checkbox. | Non-compliance with Section 6 of DPDP Act 2023. | **REMEDIATED** | Added un-ticked affirmative consent checkbox citing DPDP Act 2023 and hyperlinking to Privacy Policy. | **YES** |
| **PRV-002** | **CRITICAL** | Data Exposure | Real individual names ("Abhishek Sharma", "Atal Pandey") embedded in source code, comments, and seed data. | Unauthorized personal exposure and breach of data minimization. | **REMEDIATED** | Eradicated all personal names from the entire codebase; standardized on corporate entity "Varsaka Labs". | **NO** |
| **PRV-003** | **HIGH** | Unconsented Tracking | Hardcoded GA4 analytics tag (`G-XXXXXXXXXX`) initialized without prior cookie banner consent. | Violation of DPDP Act and European e-Privacy Directive. | **REMEDIATED** | Purged hardcoded tag from `index.html`; script execution restricted until user clicks "Accept" on consent banner. | **YES** |
| **PRV-004** | **HIGH** | Grievance Channel | Unrouted or inactive email addresses (`privacy@`, `legal@`) listed in privacy disclaimers. | Inability of Data Principals to exercise statutory access/erasure rights. | **REMEDIATED** | Enforced universal routing of all privacy and grievance communications to `info@varsaka.com`. | **YES** |
| **PRV-005** | **MEDIUM** | Transparency Notice | Website lacked dedicated Cookies Policy and Refund Policy pages explaining tracking technologies. | Transparency deficiency regarding persistent browser cookies. | **REMEDIATED** | Deployed `/cookies-policy` and `/refund-policy` with exhaustive category breakdowns and management guides. | **YES** |
| **PRV-006** | **MEDIUM** | Resume Storage Security | Candidate resume uploads lacked client-side MIME-type restriction, risking executable upload. | Potential malicious file storage in recruitment bucket. | **REMEDIATED** | Restricted file uploads to `.pdf`, `.doc`, `.docx` with a strict 10MB size ceiling. | **NO** |
| **PRV-007** | **LOW** | Cross-Border Transfer | Primary cloud providers (Cloudflare, Supabase) have multi-region infrastructure outside India. | Potential data sovereignty considerations under future DPDP notifications. | **MONITORED** | Configured database in AWS Mumbai (`ap-south-1`). Continuous monitoring of DPBI negative lists. | **YES** |

---

## Privacy Lead Sign-Off
All critical and high-severity privacy issues have been technically resolved in the application code. Compliance with notified DPDP rules is established pending final human lawyer sign-off.
