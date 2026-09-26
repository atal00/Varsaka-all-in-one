# Varsaka API Inventory & Endpoint Catalog

**Version:** 2.2.0  
**Lead Architect:** Backend Engineering Lead  
**Last Updated:** September 2026  

---

## 1. Supabase REST API Surfaces

| Endpoint Path | HTTP Method | Auth Required | Allowed Roles | Description | Request Payload | Response Schema |
|---|---|---|---|---|---|---|
| `/rest/v1/leads` | `POST` | Public (Anon Key) | All | Submits client consultation or contact inquiry. | `{ name, email, phone?, company?, service?, message?, source? }` | `201 Created` or `{ error }` |
| `/rest/v1/leads` | `GET` | Authenticated | `admin`, `employee` | Retrieves ingested sales leads. Protected by RLS. | Query parameters (`select`, `order`, `limit`) | `200 OK` `[{ id, name, email, ... }]` |
| `/rest/v1/certificates` | `GET` | Public (Anon Key) | All | Validates public certificate by certificate ID. | `?certificate_id=eq.{id}&select=*` | `200 OK` `[{ id, full_name, role, ... }]` |
| `/rest/v1/certificates` | `POST` | Authenticated | `admin` | Issues a new intern completion certificate. | `{ full_name, internship_role, project_title, ... }` | `201 Created` `[{ id, certificate_id, ... }]` |
| `/rest/v1/blogs` | `GET` | Public (Anon Key) | All | Fetches published articles. RLS filters `status='published'`. | `?status=eq.published&order=date.desc` | `200 OK` `[{ id, title, content, ... }]` |
| `/rest/v1/blogs` | `POST` / `PATCH` | Authenticated | `admin`, `blogger` | Drafts, edits, or publishes articles. | `{ title, content, summary, author, status }` | `200 OK` / `201 Created` |
| `/rest/v1/job_applications` | `POST` | Public (Anon Key) | All | Submits internship/career candidate application. | `{ job_id, full_name, email, phone, resume_url, portfolio }` | `201 Created` |
| `/rest/v1/rpc/log_failed_attempt` | `POST` | Public (Anon Key) | All | Increments failed login count for IP; activates block if >=3. | `{ p_ip: string, p_app: string }` | `204 No Content` |
| `/rest/v1/rpc/is_ip_blocked` | `POST` | Public (Anon Key) | All | Checks if calling client IP is currently blacklisted. | `{ p_ip: string, p_app: string }` | `200 OK` `{ is_blocked: boolean }` |

---

## 2. Serverless API Handlers (`invoice-generator`)

| Endpoint Path | HTTP Method | Auth Required | Description | Request Body | Response Codes |
|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Dynamic | NextAuth session handler, credentials login, and JWT token rotation. | `{ email, password }` | `200 OK`, `401 Unauthorized` |
| `/api/setup` | `POST` | Internal Secret | Bootstraps initial administrator credentials in cold deployment. | `{ setupToken, adminEmail, adminPassword }` | `200 OK`, `403 Forbidden` |

---

## 3. External API Gateways

| Provider | Endpoint | Method | Purpose | Data Transmitted | SLA / Rate Limit |
|---|---|---|---|---|---|
| **FormSubmit.co** | `https://formsubmit.co/ajax/info@varsaka.com` | `POST` | Redundant asynchronous lead delivery to company inbox. | Sanitized name, email, phone, message, timestamp. | 100 requests / minute / domain |
| **Supabase Storage** | `https://[ref].supabase.co/storage/v1/object/resumes/*` | `POST` | Secure storage of applicant resumes. | File binary (`.pdf`, `.docx`), max 10MB. | 50 MB / object limit |

---

## 4. API Security Invariants
- All client-to-API communication is strictly forced over TLS 1.3.
- Rate limiting is enforced at edge CDN and PostgreSQL procedural level (`IpBlock`).
- Database service role key is NEVER sent to client browsers.
