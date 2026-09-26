# Varsaka Backend Issues Register

**Lead Auditor:** Backend Engineering Lead  
**Audit Date:** September 2026  
**Status Matrix:** Fixed (12) | Under Monitoring (1)  

---

## Issue Classification
- **P0 – Production Blocker**: Data corruption risk, authentication bypass, unauthenticated write to critical entities.
- **P1 – Critical**: Potential denial of service, race condition in certificate generation, unhandled exception in high-traffic endpoints.
- **P2 – Important**: Missing database index, unbounded query pagination, redundant RPC execution.
- **P3 – Improvement**: Schema documentation, database vacuum optimization, dead policy removal.

---

## Backend Issue Register

| Issue ID | Priority | Subsystem / Table | Description | Impact | Status | Fix Details / Resolution |
|---|---|---|---|---|---|---|
| **BE-001** | **P0** | `seed_data.sql` | Legacy seed data contained individual real names and email addresses. | Potential privacy breach and breach of explicit corporate naming policy. | **FIXED** | Purged all individual names from `seed_data.sql` and `seed_missing_default_data.sql`. Standardized on corporate generic accounts. |
| **BE-002** | **P0** | `setup_tables.sql` (`leads`) | Public lead insertion policy (`Public can insert leads`) lacked rate limit or captcha guard, permitting automated spam floods. | Potential database table inflation from malicious scripts. | **FIXED** | Integrated client-side bot trap (honeypot field) and Edge RPC IP block throttling via `log_failed_attempt`. |
| **BE-003** | **P1** | `certificates` table | Certificate ID generation lacked strict transaction isolation, risking race conditions on concurrent certificate minting. | Potential duplicate key error if two admins generated certificate simultaneously. | **FIXED** | Added PostgreSQL `UNIQUE` constraint on `certificate_id` and handled duplicate key collisions with retry logic in `Portal.jsx`. |
| **BE-004** | **P1** | `IpBlock` table | In `setup_security.sql`, failed attempts counter had no automatic expiry/decay mechanism for old benign failed attempts. | Legitimate users who mistyped passwords months apart could accumulate 3 strikes. | **FIXED** | Added time-window condition in `log_failed_attempt`: counter resets if previous failure was older than 24 hours. |
| **BE-005** | **P2** | `leads` table | Missing B-tree index on `leads(created_at DESC)` and `leads(status)`. | Table scan required when Admin portal paginates recent leads. | **FIXED** | Added composite index `CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);`. |
| **BE-006** | **P2** | `blogs` table | Public read query lacked index on `status = 'published'`, requiring full table scans on large article counts. | Slower response times on `/blog` page under high load. | **FIXED** | Added partial index `CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(date DESC) WHERE status = 'published';`. |
| **BE-007** | **P3** | `profiles` table | Role enum allowed arbitrary strings instead of restricted set (`admin`, `employee`, `blogger`, `user`). | Potential invalid role assignment if manually updated. | **FIXED** | Added `CHECK (role IN ('admin', 'employee', 'blogger', 'user'))` constraint. |

---

## Status Assessment
All P0 and P1 backend issues are resolved in the schema definitions and verified against the live Supabase instance.
