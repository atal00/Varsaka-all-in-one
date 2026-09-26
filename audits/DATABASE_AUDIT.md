# Varsaka Database & Data Architecture Audit

**Lead Auditor:** Backend Engineering Lead  
**Database Engine:** PostgreSQL 15.6 (Supabase Managed Cloud)  
**ORM Tooling:** Prisma v6 (`varsaka-blogs`), Prisma v5 (`invoice-generator`), `@supabase/supabase-js` v2  
**Audit Status:** COMPLETE  

---

## 1. Relational Schema Architecture

```
 ┌──────────────────────┐         ┌──────────────────────┐
 │      auth.users      │         │       profiles       │
 ├──────────────────────┤         ├──────────────────────┤
 │ id (UUID, PK)        ◄─────────┤ id (UUID, PK, FK)    │
 │ email                │ 1     1 │ full_name            │
 │ encrypted_password   │         │ role ('admin', etc.) │
 └──────────────────────┘         │ permissions (JSONB)  │
                                  └──────────┬───────────┘
                                             │ 1
                                             │
                                             │ * (assigned_to)
                                  ┌──────────▼───────────┐
                                  │        leads         │
                                  ├──────────────────────┤
                                  │ id (UUID, PK)        │
                                  │ name, email, phone   │
                                  │ company, service     │
                                  │ status ('new', etc.) │
                                  │ created_at           │
                                  └──────────────────────┘

 ┌──────────────────────┐         ┌──────────────────────┐
 │     certificates     │         │        blogs         │
 ├──────────────────────┤         ├──────────────────────┤
 │ id (UUID, PK)        │         │ id (UUID, PK)        │
 │ certificate_id (UQ)  │         │ title, content       │
 │ full_name, role      │         │ author, status       │
 │ project_title, grade │         │ views, date          │
 │ start_date, end_date │         └──────────────────────┘
 └──────────────────────┘
```

---

## 2. Table-by-Table Technical Audit

| Table Name | Primary Key | Foreign Keys | RLS Status | Read Policy | Write Policy | Critical Indexes |
|---|---|---|---|---|---|---|
| `profiles` | `id (UUID)` | `auth.users(id)` | **ENABLED** | Self or Admin | Admin only | `profiles_pkey` |
| `leads` | `id (UUID)` | `profiles(id)` | **ENABLED** | Admin / Employee | Public Insert (validated) | `idx_leads_status_created` |
| `services` | `id (UUID)` | None | **ENABLED** | Public | Admin only | `services_pkey` |
| `blogs` | `id (UUID)` | None | **ENABLED** | Public if published | Admin / Blogger | `idx_blogs_published` |
| `certificates` | `id (UUID)` | None | **ENABLED** | Public by ID | Admin only | `certificates_cert_id_key` (UNIQUE) |
| `testimonials` | `id (UUID)` | None | **ENABLED** | Public if approved | Admin only | `testimonials_pkey` |
| `faqs` | `id (UUID)` | None | **ENABLED** | Public | Admin only | `faqs_pkey` |
| `jobs` | `id (UUID)` | None | **ENABLED** | Public if active | Admin only | `jobs_pkey` |
| `job_applications` | `id (UUID)` | `jobs(id)` | **ENABLED** | Admin only | Public Insert | `job_applications_pkey` |
| `IpBlock` | `id (TEXT)` | None | **ENABLED** | Authenticated | System Function / Admin | `IpBlock_ip_app_key` (UNIQUE) |

---

## 3. Row Level Security (RLS) Verification

Every table exposed to Supabase REST clients has RLS active (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`).
Key policy definitions:
- **`leads` Table**:
  ```sql
  CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
  CREATE POLICY "Admin can view leads" ON leads FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'employee'))
  );
  ```
- **`certificates` Table**:
  ```sql
  CREATE POLICY "Public can view valid certificates" ON certificates FOR SELECT USING (true);
  CREATE POLICY "Admin can manage certificates" ON certificates FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
  ```

---

## 4. Backup, Retention & Disaster Recovery
- **Continuous Backups**: Managed Supabase Point-in-Time Recovery (PITR) with write-ahead logs (WAL) streamed continuously.
- **Data Retention**:
  - Inactive leads older than 365 days are archived to encrypted cold storage.
  - IP block records automatically pruned after expiration (`blockedUntil < NOW() - INTERVAL '7 days'`).
  - Certificates are retained indefinitely to guarantee permanent verification URLs for alumni.
