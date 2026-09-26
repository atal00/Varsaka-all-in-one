# Varsaka Personal Data Flow Map & Architecture

**Lead Architect:** Privacy and Data Protection Lead  
**Diagram Standard:** Mermaid & Structured Data Flow Tables  
**Status:** COMPLETE  

---

## 1. End-to-End Data Ingestion Flows

### Flow 1: Enterprise Lead Consultation Request
```
[User Browser]
      │
      │ 1. Inputs: Name, Email, Phone, Company, Service, Message
      │ 2. Ticks Affirmative DPDP Consent Checkbox
      │ 3. Client validates format & DOMPurify sanitizes
      ▼
[HTTPS POST -> Edge Cloudflare]
      │
      ├───────────────────────────────────────────┐
      │ (Encrypted Payload)                       │ (Redundant Delivery)
      ▼                                           ▼
[Supabase PostgREST Gateway]               [FormSubmit.co API]
      │                                           │
      ▼                                           ▼
[PostgreSQL `leads` Table]                 [Encrypted Email Dispatch]
      │                                           │
      ▼                                           ▼
[Protected by RLS: Admin Read Only]        [varsaka Inbox: info@varsaka.com]
```

### Flow 2: Career / Internship Candidate Application
```
[Applicant Browser]
      │
      │ 1. Enters: Full Name, Email, Phone, Portfolio Link
      │ 2. Selects Resume File (.pdf / .docx, max 10MB)
      │ 3. Clicks Affirmative DPDP Recruitment Consent
      ▼
[Client-side File Inspection & Size Verification]
      │
      ├───────────────────────────────────────────┐
      │ (Resume Binary)                           │ (Metadata)
      ▼                                           ▼
[Supabase Storage: /resumes/]              [PostgreSQL `job_applications`]
      │                                           │
      ▼                                           ▼
[Private Access Bucket]                    [Linked Foreign Key to `jobs`]
```

### Flow 3: Certificate Verification Journey
```
[Third-Party Verifier / Employer]
      │
      │ 1. Navigates to: varsaka.com/verify/VAR-INT-2026-002 (or scans QR)
      ▼
[Client Browser queries Supabase REST]
      │
      │ GET /rest/v1/certificates?certificate_id=eq.VAR-INT-2026-002
      ▼
[PostgreSQL Database Engine]
      │
      │ Indexed B-Tree search on `certificate_id`
      ▼
[Returns Read-Only Public Metadata: Name, Role, Issue Date, Grade]
      │
      ▼
[Renders Digital Certificate with Official Seal & Verification Stamp]
```

---

## 2. Third-Party Data Disclosures & Processing Agreements

| Third-Party Processor | Service Provided | Data Shared | Transmission Protocol | Security Safeguards | Legal DPA Status |
|---|---|---|---|---|---|
| **Supabase Inc.** | Managed PostgreSQL DB, Auth, Object Storage | Leads, Application metadata, Hashed Passwords, Resumes | TLS 1.3 / AES-256 Storage | SOC 2 Type II, ISO 27001, AWS Mumbai ap-south-1 | Standard Cloud DPA active |
| **Cloudflare Inc.** | Global Anycast DNS, WAF, Edge CDN, SSL Termination | IP address, User-Agent, HTTP Request Headers | TLS 1.3 / HTTP/3 | ISO 27001, SOC 2, HIPAA compliant edge | Standard Enterprise DPA active |
| **FormSubmit.co** | Form API Gateway for redundant email alerting | Sanitized lead contact fields (Name, Email, Message) | HTTPS POST | TLS in transit; unpersisted transit forwarder | Standard Terms of Service |

---

## 3. Storage & Destruction Workflow
- **Lead Data**: Automatically flagged for archival after 365 days of inactivity. Hard-deleted within 48 hours upon Data Principal request.
- **Applicant Data**: Hard-deleted within 180 days post-hiring cycle completion.
- **Certificate Data**: Retained indefinitely as a verifiable permanent credential for the student.
