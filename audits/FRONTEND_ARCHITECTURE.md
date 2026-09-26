# Varsaka Frontend Architecture & Engineering Standards

**Version:** 3.1.0  
**Lead Architect:** Senior Frontend Engineering Lead  
**Scope:** `varsaka-react`, `varsaka-admin`, `varsaka-blogs`, `invoice-generator`  

---

## 1. System Topology & Architectural Blueprint

```
                      ┌──────────────────────────────────────────────┐
                      │              Edge CDN / DNS                  │
                      │               (Cloudflare)                   │
                      └──────┬───────────────────────┬───────────────┘
                             │                       │
           ┌─────────────────▼─────────┐   ┌─────────▼───────────────┐
           │     varsaka.com (CSR)     │   │   blog.varsaka.com      │
           │       varsaka-react       │   │    varsaka-blogs (Next) │
           └─────────┬─────────────────┘   └─────────┬───────────────┘
                     │                               │
        ┌────────────┼────────────────┐              │
        │            │                │              │
 ┌──────▼──────┐ ┌───▼────────┐ ┌─────▼───────┐      │
 │  Marketing  │ │ Case Study │ │ Client/Op   │      │
 │  Pages &    │ │ & Research │ │ Portal      │      │
 │  Services   │ │ Hub        │ │ (Protected) │      │
 └──────┬──────┘ └───┬────────┘ └─────┬───────┘      │
        │            │                │              │
        └────────────┴────────┬───────┴──────────────┘
                              │
               ┌──────────────▼──────────────┐
               │    Backend Service Layer    │
               │   Supabase Postgres + Auth  │
               │   FormSubmit.co API Gateway │
               └─────────────────────────────┘
```

---

## 2. Detailed Application Breakdown

### 2.1 `varsaka-react` (Primary Client & Operations Application)
- **Role**: Serves the primary brand experience, testing solutions catalog, career portal, interactive certificate validator, and secure internal client portal.
- **Routing Paradigm**: Client-Side Routing with `react-router-dom` v6.
- **Code Splitting Strategy**:
  - Critical Entry (`index.html` + `main.jsx` + `Navbar` + `Home`): Loaded immediately on first paint.
  - Secondary Routes: Dynamic lazy loading via `React.lazy()` with `<Suspense>` boundary.
  - Chunk isolation: Heavy vendor libraries (`@supabase/supabase-js`, `dompurify`) isolated into dedicated vendor chunks (`supabaseClient-*.js`, `purify.es-*.js`).
- **State Architecture**:
  - `AuthContext`: Centralized authentication store managing Supabase JWT, user session, and permission roles.
  - `Form State`: Uncontrolled inputs with real-time validation handlers to prevent expensive re-renders on every keystroke.

### 2.2 `varsaka-admin` (Executive Backoffice)
- **Role**: Secure administrative surface for managing leads, vetting internship applications, issuing cryptographically signed completion certificates, and editing blog posts.
- **Security Boundary**: Strict multi-tier role verification. Ineffective or expired tokens automatically drop user to `/login` with clean state wipe.

### 2.3 `varsaka-blogs` (Next.js Intelligence & Case Study Engine)
- **Role**: Server-side rendered and statically generated intelligence publications, technical deep-dives, and automated case studies.
- **Framework**: Next.js 16 (App Router) with Prisma 6 ORM.
- **Rendering**: Static Site Generation (SSG) for published articles and case studies with on-demand revalidation.

### 2.4 `invoice-generator` (Enterprise Billing Module)
- **Role**: Secure, client-side capable enterprise invoice and estimate generation with cryptographic checksums and PDF export.
- **State Store**: Zustand store backed by local browser IndexedDB (`idb`) for offline continuity.

---

## 3. Data Flow & Security Protocols

### 3.1 Input Sanitization Pipeline
```
[User Form Input] 
       │
       ▼
[Client-side Regex & Boundary Validation] 
       │
       ▼
[DOMPurify Sanitization Engine] 
       │
       ▼
[Explicit DPDP Consent Check] 
       │
       ▼
[Encrypted HTTPS POST -> API Gateway / Supabase]
```

### 3.2 Production Hardening Standards
1. **Console Purge**: No `console.log` or debug statements emit data in production builds.
2. **Environment Isolation**: Public keys (`VITE_SUPABASE_ANON_KEY`) are scoped strictly to read-only or RLS-protected database tables. Service role keys are never bundled in frontend code.
3. **No Dynamic Code Injection**: No use of `dangerouslySetInnerHTML` without preceding DOMPurify execution.
4. **Third-Party Script Quarantine**: Zero unauthorized external tracking scripts or telemetry trackers.
