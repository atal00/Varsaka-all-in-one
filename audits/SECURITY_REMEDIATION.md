# Varsaka Security Remediation & Infrastructure Hardening Guide

**Lead Auditor:** Application Security (AppSec) Lead  
**Document Purpose:** Exact remediation protocols and production deployment hardening standards  
**Status:** READY FOR OPERATIONAL IMPLEMENTATION  

---

## 1. HTTP Security Response Headers (Reverse Proxy / Cloudflare)

For deployment via Cloudflare Workers, Nginx, or Netlify, inject the following HTTP headers into all outbound responses:

```http
# Strict Transport Security (HSTS) - 1 Year with Subdomains
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Clickjacking Protection
X-Frame-Options: DENY

# MIME-Type Sniffing Protection
X-Content-Type-Options: nosniff

# Referrer Information Leakage Prevention
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy (Disable unneeded browser hardware capabilities)
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()

# Content Security Policy (CSP)
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://formsubmit.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formsubmit.co;
```

---

## 2. Cross-Origin Resource Sharing (CORS) Policy

In Supabase Dashboard -> Project Settings -> API -> CORS Allowed Origins:
- **Production Allowed Origins**:
  - `https://varsaka.com`
  - `https://www.varsaka.com`
  - `https://blog.varsaka.com`
  - `https://admin.varsaka.com`
- **Reject Wildcard**: Ensure `*` is **NEVER** permitted in production CORS settings.

---

## 3. Secrets Management & Environment Isolation

### Rule 1: Public vs Private Environment Keys
- **Permitted in Frontend (`varsaka-react`, `varsaka-admin`)**:
  - `VITE_SUPABASE_URL` (Public project reference URL)
  - `VITE_SUPABASE_ANON_KEY` (Public anonymous API key governed by RLS)
- **STRICTLY FORBIDDEN in Frontend**:
  - `SUPABASE_SERVICE_ROLE_KEY` (Bypasses all RLS rules)
  - Database connection strings with raw passwords (`postgres://...`)
  - NextAuth Secret or SMTP private tokens.

### Rule 2: Periodic Key Rotation
- Rotate JWT signing secret every 180 days.
- Regularly inspect GitHub repo using GitGuardian or Trufflehog to detect accidental commits.

---

## 4. Database Hardening & Principle of Least Privilege
1. **Public Role Revocations**:
   ```sql
   REVOKE EXECUTE ON FUNCTION pg_read_file FROM public;
   REVOKE EXECUTE ON FUNCTION pg_read_binary_file FROM public;
   ```
2. **Strict RLS Enforcement**:
   No new tables may be created without immediate `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;`.

---

## 5. Security Incident Response Plan (CERT-In Mandate)
Under India's CERT-In directives (Cybersecurity Directions under Section 70B of IT Act 2000):
- **Incident Reporting Window**: Report cyber security incidents to CERT-In within **6 hours** of noticing.
- **Dedicated Point of Contact**: Security inquiries routed directly to `info@varsaka.com`.
- **System Logs Retention**: Maintain secure, synchronized system and access logs for a rolling period of **180 days**.
