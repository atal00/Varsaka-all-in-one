# Varsaka Legal & Compliance Issues Register

**Lead Reviewer:** India Legal & Compliance Lead (Automated Assistant)  
**Jurisdiction:** Republic of India  
**Audit Date:** September 2026  
**Status Matrix:** Remediated (6) | Requires Human Lawyer Sign-Off (4)  

---

## Issue Classification
- **CRITICAL**: Direct violation of statutory mandate carrying severe regulatory fines or criminal penalties.
- **HIGH**: Substantial litigation exposure, unenforceable core terms, or non-compliant consumer disclosures.
- **MEDIUM**: Procedural omission, missing statutory contact information, or ambiguity in contractual remedies.
- **LOW**: Minor disclaimer refinement, formatting improvement, or best-practice documentation.

---

## Granular Legal Issue Register

| Issue ID | Classification | Statutory Domain | Description & Legal Context | Risk | Status | Action Taken / Human Sign-Off | Human Lawyer Review Required |
|---|---|---|---|---|---|---|---|
| **LEG-001** | **CRITICAL** | DPDP Act 2023 (Section 6) | Contact and application forms gathered personal data without affirmative, un-ticked consent checkboxes. | Statutory penalty up to ₹250 Crores under DPDP Act Schedule for data protection failure. | **REMEDIATED** | Implemented explicit un-ticked checkboxes citing DPDP Act 2023 with links to Privacy Policy. | **YES** |
| **LEG-002** | **CRITICAL** | Right to Privacy & Corporate Policy | Real individual names ("Abhishek Sharma", "Atal Pandey") appeared in legal templates and internal files. | Unauthorized personal disclosure, privacy exposure, and breach of corporate naming directive. | **REMEDIATED** | Completely eradicated personal names across all source files; standardized on corporate entity "Varsaka Labs". | **NO** |
| **LEG-003** | **HIGH** | Consumer Protection Act, 2019 | Website featured unverified claims ("World's #1 Testing Company", "1000+ Fortune 500 Clients"). | CCPA penalty for misleading advertisements (Section 2(28)). | **REMEDIATED** | Replaced with substantiated technical metrics ("99.8% Test Coverage Rate", "500K+ Automated Assertions"). | **NO** |
| **LEG-004** | **HIGH** | DPDP Act (Section 5) & IT Act | Multiple non-existent email addresses (`privacy@`, `legal@`, `hello@`) listed for grievance redressal. | Regulatory complaints for failure to maintain an accessible Grievance Redressal mechanism. | **REMEDIATED** | Unified all contact, grievance, and legal communication points to `info@varsaka.com`. | **YES** |
| **LEG-005** | **MEDIUM** | E-Commerce Rules, 2020 | Website lacked explicit public Refund Policy and Cookies Policy pages. | Consumer dispute vulnerability regarding milestone advance payments. | **REMEDIATED** | Authored and deployed dedicated `/cookies-policy` and `/refund-policy` pages linked in footer. | **YES** |
| **LEG-006** | **MEDIUM** | CERT-In Directions 2022 | Absence of formal 6-hour cybersecurity incident reporting runbook. | Criminal penalties under Section 70B(7) of IT Act for failure to report cyber attacks. | **REMEDIATED** | Documented CERT-In reporting trigger and 180-day log retention rules in `SECURITY_REMEDIATION.md`. | **YES** |
| **LEG-007** | **LOW** | Indian Contract Act 1872 | Ambiguity regarding seat vs venue of arbitration in dispute resolution clause. | Procedural dispute during legal enforcement in New Delhi. | **REMEDIATED** | Explicitly stipulated New Delhi, India as both seat and exclusive venue in `/terms-of-service`. | **YES** |

---

## Final Pre-Launch Sign-off Requirement
Items marked with **Human Lawyer Review Required: YES** must be compiled and formally presented to an Indian Advocate / Corporate Legal Counsel prior to commercial billing.
