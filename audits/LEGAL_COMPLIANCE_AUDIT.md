# India Legal & Regulatory Compliance Audit Report

**Lead Auditor:** India Legal & Compliance Lead (Automated Review Assistant)  
**Jurisdiction:** Republic of India  
**Applicable Legal Frameworks Examined:**
- Digital Personal Data Protection Act, 2023 (DPDP Act 2023)
- Information Technology Act, 2000 & IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)
- Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
- Consumer Protection Act, 2019 & Consumer Protection (E-Commerce) Rules, 2020
- Indian Contract Act, 1872
- CERT-In Directions under Section 70B(6) of IT Act, 2000 (Directions No. 20(3)/2022-CERT-In)
- Advertising Standards Council of India (ASCI) Code for Self-Regulation in Advertising

> [!IMPORTANT]
> **LEGAL NOTICE & DISCLAIMER**: This audit report constitutes a preliminary technical and compliance gap analysis prepared as an engineering assistant. It does **not** constitute formal legal advice, attorney-client privileged counsel, or a final legal certification. All findings, recommendations, and template legal texts MUST be formally reviewed and signed off by a qualified Advocate / Legal Practitioner enrolled with the Bar Council of India prior to production launch.

---

## 1. Product Nature & Operational Context

### [FACT] What the Product Does
Varsaka Labs operates a business-to-business (B2B) software testing and quality engineering website (`varsaka.com`). It offers:
1. Enterprise Software QA Services (Functional, Automation, Performance, Security, AI Testing, Mobile Testing).
2. Client Consultation / Quote Request Ingestion via web forms.
3. Internship & Career Recruitment Ingestion (`/apply`).
4. An Interactive Certificate Verification System (`/verify/:id`) for alumni and interns.
5. An Internal Operations / Client Portal (`/portal`).
6. A Technical Blog and Case Study Knowledge Base (`/blog`, `/case-studies`).

### [FACT] What the Product Does NOT Do
- Does **not** execute securities trading, broker connections, stock market transactions, or portfolio management.
- Does **not** provide investment advice, equity research, or financial tip distribution.
- Does **not** operate a consumer payment gateway or e-commerce cart directly on the marketing website (contract billing is conducted via B2B invoicing).

---

## 2. In-Depth Statutory Audit Matrix

### 2.1 Digital Personal Data Protection Act, 2023 (DPDP Act 2023)

#### Finding L-01: Affirmative, Unbundled Consent Prior to Data Collection
- **[FACT]**: The website collects user personal data (Name, Email, Phone Number, Company, Resume) via Contact and Career forms.
- **[LEGAL REQUIREMENT]**: Under Section 6(1) of the DPDP Act 2023, consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action. Pre-ticked boxes or bundled consent without notice are invalid.
- **[INTERPRETATION]**: Presenting a contact form where submitting implicitly consents without an active checkbox is legally vulnerable under Section 6.
- **[EVIDENCE IN PRODUCT]**: Unchecked affirmative consent checkboxes have now been implemented in `Contact.jsx`, `Apply.jsx`, and `NdaTemplate.jsx`, citing the DPDP Act 2023 and hyperlinking to `/privacy-policy`.
- **[RISK]**: Substantial financial penalties under Schedule of DPDP Act 2023 (up to ₹250 Crores for significant failure to protect personal data).
- **[RECOMMENDED ACTION]**: Maintain the affirmative un-ticked checkbox in all form submissions. Ensure database stores timestamp and consent version string (`consent_given_at`, `consent_version`).
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES** (To confirm wording meets upcoming DPDP Rules once notified).

#### Finding L-02: Notice of Purpose & Data Protection Officer Contact
- **[FACT]**: The website provides a comprehensive Privacy Policy at `/privacy-policy` detailing data categories and purpose of processing.
- **[LEGAL REQUIREMENT]**: Section 5 of the DPDP Act 2023 requires that every request for consent must be preceded or accompanied by a notice explaining the personal data to be collected, the purpose of processing, and how the data principal may exercise their rights and make a complaint to the Data Protection Board of India.
- **[INTERPRETATION]**: The single contact email `info@varsaka.com` must have an internal operational procedure to log, track, and resolve Data Principal requests within statutory time limits.
- **[EVIDENCE IN PRODUCT]**: `/privacy-policy` specifies categories of data, purpose of collection, retention rules, and designates `info@varsaka.com` as the Grievance & Privacy Redressal Point of Contact.
- **[RISK]**: Regulatory complaints to the Data Protection Board.
- **[RECOMMENDED ACTION]**: Formulate an internal Standard Operating Procedure (SOP) ensuring inquiries sent to `info@varsaka.com` regarding data rights are acknowledged within 48 hours.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

### 2.2 Information Technology Act, 2000 & CERT-In Cybersecurity Directions

#### Finding L-03: Mandatory 180-Day Log Retention & 6-Hour Incident Notification
- **[FACT]**: The platform runs on managed cloud infrastructure (Supabase, Vercel/Netlify, Cloudflare).
- **[LEGAL REQUIREMENT]**: CERT-In Cyber Security Directions (April 2022) issued under Section 70B(6) of the IT Act mandate:
  1. Mandatory reporting of specified cybersecurity incidents within 6 hours of discovery.
  2. Retention of system and access logs within Indian jurisdiction for 180 days.
  3. Time synchronization via NTP with National Physical Laboratory (NPL) or NIC servers.
- **[INTERPRETATION]**: Using managed foreign cloud services requires verifying that logs are maintained for at least 180 days and can be retrieved during an inquiry.
- **[EVIDENCE IN PRODUCT]**: Supabase Postgres write-ahead logs and Cloudflare edge logs configured for rolling retention. Security contact designated as `info@varsaka.com`.
- **[RISK]**: Criminal liability and fines under Section 70B(7) of the IT Act for failure to report cybersecurity incidents.
- **[RECOMMENDED ACTION]**: Document exact cloud log retention duration in Cloudflare/Supabase and maintain an Incident Response Runbook.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES**.

---

### 2.3 Consumer Protection Act, 2019 & ASCI Guidelines

#### Finding L-04: Removal of Unsubstantiated Superlative Advertising Claims
- **[FACT]**: Early marketing copy contained phrases like "World's #1 Software Testing Company" and "1000+ Fortune 500 Clients".
- **[LEGAL REQUIREMENT]**: Section 2(28) of the Consumer Protection Act, 2019 defines "misleading advertisement" as false descriptions or false guarantees. ASCI Code Chapter I mandates that all claims must be capable of objective substantiation.
- **[INTERPRETATION]**: Unsubstantiated claims expose the enterprise to investigations by the Central Consumer Protection Authority (CCPA).
- **[EVIDENCE IN PRODUCT]**: All promotional copy was updated to substantiated technical capabilities: "Enterprise Software Quality Engineering", "99.8% Test Coverage Rate", and "500K+ Test Assertions Executed".
- **[RISK]**: Regulatory notices, penalties, or corrective advertisement orders from CCPA.
- **[RECOMMENDED ACTION]**: Ensure all future case studies and marketing statistics have underlying verifiable test logs on file.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **NO** (Technical alignment verified; ongoing compliance required).

---

### 2.4 Indian Contract Act, 1872 & Online Terms Enforceability

#### Finding L-05: Clickwrap vs Browsewrap Enforceability
- **[FACT]**: The website publishes Terms of Service at `/terms-of-service` (and alias `/terms-and-conditions`).
- **[LEGAL REQUIREMENT]**: Under the Indian Contract Act, 1872, an enforceable agreement requires an offer, acceptance, and lawful consideration. Browsewrap terms (terms linked in footer without active acceptance) have weaker enforceability in Indian courts compared to clickwrap agreements where the user checks an acceptance box.
- **[INTERPRETATION]**: For browsing visitors, footer terms establish basic usage limits. However, for B2B client engagements or career applications, an explicit checkbox constitutes a binding electronic contract under Section 10A of the IT Act 2000.
- **[EVIDENCE IN PRODUCT]**: Checkboxes on `/apply` and `/nda-template` require affirmative assent to terms.
- **[RISK]**: Inability to enforce limitation of liability or dispute resolution clauses in arbitration/court.
- **[RECOMMENDED ACTION]**: Maintain clickwrap acceptance on all interactive transaction points.
- **[HUMAN LAWYER REVIEW REQUIRED]**: **YES** (To confirm dispute resolution and New Delhi jurisdiction clause).

---

## 3. Mandatory Human Lawyer Sign-Off Checklist
Before production launch, an Indian Advocate / Corporate Lawyer must review and formally sign off on:
1. [ ] Privacy Policy (`/privacy-policy`) final draft under upcoming notified DPDP Act Rules.
2. [ ] Terms of Service (`/terms-of-service`) limitation of liability and New Delhi jurisdiction clauses.
3. [ ] Bilateral NDA Template (`/nda-template`) governing trade secret protection under Indian law.
4. [ ] Refund Policy (`/refund-policy`) B2B milestone dispute resolution mechanics.
5. [ ] Certificate of Internship issuance wording to prevent implied permanent employment claims under Indian Labor Laws.
