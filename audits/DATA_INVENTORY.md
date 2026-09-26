# Varsaka Personal Data Inventory & Data Processing Register

**Lead Auditor:** Privacy and Data Protection Lead  
**Audit Standard:** ISO/IEC 27701 (Privacy Information Management) & India DPDP Act 2023  
**Audit Date:** September 2026  
**Status:** COMPLETE  

---

## Comprehensive Data Inventory Matrix

| Data Category | Specific Data Attributes | Processing Purpose | Storage Location | Access Controls | Retention Period | Third-Party Sharing | Deletion Supported? | Consent Required? | Legal Review |
|---|---|---|---|---|---|---|---|---|---|
| **Contact Information** | Full Name, Email Address, Phone Number, Company Name | Responding to enterprise testing inquiries and quote requests. | Supabase PostgreSQL `leads` table | Restricted to `admin` and `employee` roles via RLS | 365 days from last contact, or until deletion requested | Shared with FormSubmit.co for inbox delivery | **YES** (via `info@varsaka.com`) | **YES** (Section 6 Affirmative Checkbox) | **YES** |
| **Recruitment & Applicant Data** | Candidate Name, Email, Phone, Portfolio Link, Resume (`.pdf`/`.docx`) | Evaluating candidate qualifications for QA internships and engineering openings. | Supabase `job_applications` table & Storage Bucket (`resumes`) | Internal HR & Recruitment Administrators | Duration of recruitment cycle + 180 days for audit | None (stored strictly in Varsaka private cloud) | **YES** (Automated or manual upon request) | **YES** (Explicit application consent) | **YES** |
| **Authentication & Credentials** | Email, Hashed Password (`bcrypt`), Auth Tokens (JWT) | Authenticating staff and authorized client accounts into `/portal`. | Supabase `auth.users` & NextAuth DB | Encrypted; no plaintext access | Active account lifetime; deleted upon termination | Supabase Cloud (Managed Auth) | **YES** (Immediate account deletion) | Implied by account registration | **YES** |
| **Alumni & Certificate Data** | Full Name, Internship Role, Project Title, Certificate ID, Issue Date | Public verification of authentic academic/vocational training completion. | Supabase `certificates` table | Public read via unique Certificate ID; Admin write | Retained indefinitely to maintain permanent verification validity | None | **NO** (Public verification record; modification upon verification) | Provided during program registration | **YES** |
| **Device & Network Data** | IP Address, User-Agent String, Browser Version | Brute force defense, rate limiting, and security incident logging. | `IpBlock` table & Edge Server Logs | Security operations & automated PL/pgSQL function | 180 days (as mandated by CERT-In Directions 2022) | Cloudflare Edge Network | Automatically purged after 180 days | Permitted under legitimate use (security) | **YES** |
| **Cookie & Consent Preference** | `cookie_consent` key (`accepted` / `necessary`) | Storing user consent choice across sessions without tracking identity. | Browser `localStorage` (Client-side only) | Client browser exclusively | Persistent until browser cache cleared | Zero external transmission | **YES** (Clear browser data) | Not required (stores the consent state itself) | **NO** |
| **Financial / Invoicing Data** | Client Billing Entity, Tax ID (GSTIN), Billing Address, Itemized Rates | Generating commercial estimates, contracts, and milestone tax invoices. | `invoice-generator` DB / Client Browser IndexedDB | Client and authorized billing managers | 7 years (Mandated by Indian Companies Act & GST Law) | Authorized banking / CA auditing | Only after statutory 7-year retention | Contractual necessity | **YES** |

---

## Data Minimization & Privacy Protection Invariant
1. No sensitive personal data (biometrics, health, caste, religious beliefs, political affiliations) is ever requested or processed.
2. Form fields are strictly minimized: Phone number and Company name are optional.
3. Resumes are stored in private Supabase buckets with restricted access URLs.
