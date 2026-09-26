# Varsaka Privacy & Data Protection Comprehensive Audit

**Lead Auditor:** Privacy and Data Protection Lead  
**Audit Framework:** Digital Personal Data Protection Act, 2023 & Privacy by Design Principles  
**Status:** AUDIT COMPLETE & HARDENED  

---

## 1. Executive Privacy Summary

Varsaka Labs processes personal data strictly necessary for B2B engineering consultation, career recruitment, and alumni certificate verification. Following this audit, the privacy posture has been systematically upgraded:
1. **Affirmative Consent**: Replaced implicit form submission with explicit, un-ticked affirmative consent checkboxes citing Section 6 of the DPDP Act 2023.
2. **Third-Party Telemetry Shield**: Removed unconsented Google Analytics scripts from the DOM.
3. **Single Channel Redressal**: All privacy inquiries, data deletion requests, and grievance escalation route to a single official monitored inbox: `info@varsaka.com`.
4. **Data Minimization**: Non-essential personal identifiers purged from databases and source code.

---

## 2. Statutory Privacy Principles Evaluation

| DPDP Act Principle | Statutory Standard | Varsaka Technical Implementation | Audit Verdict |
|---|---|---|---|
| **Principle of Consent & Notice** | Data processing must be preceded by clear notice and affirmative consent (Sections 5 & 6). | Un-ticked checkboxes linked directly to Privacy Policy on all input forms. | **COMPLIANT** |
| **Principle of Purpose Limitation** | Data processed only for stated purpose (Section 4). | Lead data used exclusively for answering consultation queries; applicant data used only for hiring. | **COMPLIANT** |
| **Principle of Data Minimization** | Collect only data necessary for stated purpose (Section 6(1)). | Phone and Company fields made optional. No financial or biometric data collected. | **COMPLIANT** |
| **Principle of Data Accuracy** | Maintain accurate, complete, and consistent data (Section 8(3)). | Self-service profile updates in `/portal`; correction requests supported via `info@varsaka.com`. | **COMPLIANT** |
| **Principle of Storage Limitation** | Data retained only as long as needed for purpose (Section 8(7)). | Inactive leads archived after 365 days; temporary security logs purged after 180 days. | **COMPLIANT** |
| **Principle of Reasonable Safeguards** | Implement reasonable security safeguards to prevent breach (Section 8(5)). | PostgreSQL RLS, TLS 1.3, DOMPurify XSS filter, hashed passwords, IP block defenses. | **COMPLIANT** |

---

## 3. Cross-Border Data Transfer Audit
- **[FACT]**: Supabase, Cloudflare, and FormSubmit operate distributed cloud infrastructure that may route or store data outside the territory of India (e.g. US or EU data centers).
- **[LEGAL REQUIREMENT]**: Under Section 16 of the DPDP Act 2023, personal data may be transferred outside India to any country EXCEPT those specifically restricted or blacklisted by the Central Government.
- **[INTERPRETATION]**: As of current date, the Central Government has not notified a negative blacklist. Therefore, cloud hosting in standard jurisdictions (US, EU, Singapore) is permissible.
- **[RECOMMENDED ACTION]**: Request Supabase to host primary production database instances in the AWS Mumbai region (`ap-south-1`) to minimize cross-border exposure.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

## 4. Grievance Redressal & Data Subject Rights Protocol
1. **Receipt**: Inquiries received at `info@varsaka.com` are assigned a unique tracking ticket.
2. **Identity Verification**: Requester must verify ownership of the email address.
3. **Fulfillment**:
   - Access requests: Export lead/application records to JSON/PDF within 7 business days.
   - Erasure requests: Hard delete record from PostgreSQL within 48 hours; return confirmation.
4. **Escalation**: If unsatisfied, the user is notified of their right to escalate to the **Data Protection Board of India**.
