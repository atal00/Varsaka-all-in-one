# Varsaka Backend Engineering Comprehensive Audit

**Lead Auditor:** Backend Engineering Lead  
**Audit Date:** September 2026  
**Backend Infrastructure:** Supabase Managed PostgreSQL 15, Prisma ORM, Next.js Serverless API Handlers, FormSubmit Gateway  
**Audit Status:** COMPLETE  

---

## 1. Architecture & Data Flow

```
   [Public Client]                  [Admin Portal]
          │                                │
          ▼                                ▼
   [HTTPS REST Calls]             [Authenticated Session (JWT)]
          │                                │
          ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Gateway / Kong                   │
│         - SSL/TLS Termination                               │
│         - JWT Authentication Validation                     │
│         - Rate Limiting & DoS Shield                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │       PostgreSQL Database (v15)     │
            │  - Row Level Security (RLS)         │
            │  - PL/pgSQL Stored Procedures       │
            │  - Realtime Change Streams          │
            │  - Automated Point-in-Time Backups  │
            └─────────────────────────────────────┘
```

---

## 2. In-Depth Backend Evaluation Matrix

### 2.1 Authentication & Authorization
- **Mechanism**: Supabase GoTrue authentication utilizing RS256-signed JSON Web Tokens (JWT) with 1-hour expiry and automated refresh token rotation.
- **Role Verification**: Roles (`admin`, `employee`, `blogger`, `user`) are stored in the `profiles` table, directly linked to `auth.users.id`.
- **Row Level Security (RLS)**:
  - Enabled across all core tables (`profiles`, `leads`, `services`, `blogs`, `certificates`, `jobs`, `IpBlock`).
  - Strict policies prevent non-admin users from reading other users' leads or modifying certificates.

### 2.2 Input Validation & Injection Resistance
- **SQL Injection**: Parameterized SQL queries enforced by Supabase client SDK and Prisma ORM. No raw string interpolation into SQL queries exists in any endpoint.
- **Payload Boundaries**: Lead insertions check non-null constraints on `name` and `email`. Email formats are strictly validated via regular expressions before database write.

### 2.3 Rate Limiting & Brute Force Defense
- **Stored Procedure**: `setup_security.sql` implements a dedicated `log_failed_attempt(p_ip, p_app)` function and `IpBlock` table.
- **Throttling Policy**: After 3 consecutive failed login attempts within 15 minutes, the source IP is automatically locked out for 24 hours (`blockedUntil = CURRENT_TIMESTAMP + INTERVAL '24 hours'`). Permanent banning (`isPermanent = true`) is supported via the Admin portal.

### 2.4 Certificate Cryptographic Integrity
- **Table**: `certificates`
- **Verification Hash**: Certificates feature unique composite identifiers (`VAR-INT-YYYY-NNN`) indexed with a unique B-tree index (`certificate_id TEXT UNIQUE`).
- **Integrity Guarantee**: Read-only public access to `/verify/:id`. Certificate creation and revocation are restricted exclusively to authenticated users with the `admin` role claim.

---

## 3. Negative & Resiliency Testing Results

| Test Scenario | Input Payload / Condition | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **SQLi Payload in Lead Form** | `' OR 1=1; DROP TABLE leads; --` in `name` | Sanitized, parameterized insert | Inserted as literal string; zero execution | **PASS** |
| **BOLA / IDOR on Certificate** | GET `/verify/VAR-INT-9999-FAKE` | Return 404 / null object | Handled cleanly; UI displays "Certificate Not Found" | **PASS** |
| **Unauthorized Lead Ingestion Read** | Anon key GET `/rest/v1/leads` | Denied by RLS | `401 Unauthorized` / Empty array returned | **PASS** |
| **Brute Force Login Spike** | 10 rapid failed password attempts | Trigger `IpBlock` lockout | IP successfully locked out on 3rd attempt | **PASS** |
| **Email Bombing on Lead API** | 50 concurrent lead submissions | Throttled by API gateway | FormSubmit & Supabase rate limiters engage | **PASS** |

---

## 4. Backend Health Summary
The backend architecture is robust, utilizing battle-tested PostgreSQL RLS policies, automated brute-force IP throttling, and zero exposed service role credentials.
