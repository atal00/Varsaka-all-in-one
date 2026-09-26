# Varsaka Cloud Infrastructure & Topology Specification

**Lead Architect:** DevOps and Infrastructure Lead  
**Topology Version:** 2.8.0  
**Primary Region:** `ap-south-1` (Mumbai, India)  

---

## 1. Global Infrastructure Topology

```
                         [Internet Traffic]
                                 │
                                 ▼
                   ┌───────────────────────────┐
                   │    Cloudflare Edge DNS    │
                   │   - Proxied (Orange Cloud)│
                   │   - TLS 1.3 / HTTP/3      │
                   │   - DDoS Shield           │
                   └─────────────┬─────────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       │                         │                         │
       ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌────────────────┐
│ varsaka.com  │         │ blog.varsaka │         │ admin.varsaka  │
│ (Netlify/SPA)│         │ (Vercel/SSR) │         │ (Netlify/SPA)  │
└──────┬───────┘         └──────┬───────┘         └───────┬────────┘
       │                        │                         │
       └────────────────────────┼─────────────────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │    Supabase Managed Cloud   │
                 │   (AWS ap-south-1, Mumbai)  │
                 │  - PgBouncer Pooler (6543)  │
                 │  - PostgreSQL 15 (Direct)   │
                 │  - S3-compatible Storage    │
                 └─────────────────────────────┘
```

---

## 2. Domain & Routing Blueprint

| Domain / Subdomain | Application | Hosting Target | Cache Policy | SSL / TLS |
|---|---|---|---|---|
| `varsaka.com` / `www` | `varsaka-react` | Netlify / Cloudflare Pages | Edge Cached (Assets: 1 year immutable; HTML: no-cache) | Cloudflare Edge SSL |
| `blog.varsaka.com` | `varsaka-blogs` | Vercel / Netlify Next.js | ISR / Edge Cached (revalidate: 3600s) | Managed SSL |
| `admin.varsaka.com` | `varsaka-admin` | Netlify / Cloudflare Pages | Strict no-store for authenticated views | Managed SSL |
| `billing.varsaka.com` | `invoice-generator` | Vercel Node Serverless | Client cache with secure session cookies | Managed SSL |

---

## 3. Database Connection Pooling (PgBouncer)
- **Direct Connection (`port 5432`)**: Used strictly for database migrations, Prisma schema pushes, and CLI admin operations.
- **Transaction Pooler (`port 6543`)**: Used by serverless functions and Next.js handlers to prevent PostgreSQL connection exhaustion under high concurrency. Maximum pool size: 50 connections.
