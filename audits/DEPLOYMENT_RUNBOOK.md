# Varsaka Production Deployment Runbook

**Lead Engineer:** DevOps and Infrastructure Lead  
**Runbook Scope:** Standard Release, Hotfix, and Emergency Rollback Procedures  
**Target Environments:** Staging (`staging.varsaka.com`) & Production (`varsaka.com`)  

---

## 1. Standard Production Release Workflow

### Step 1: Pre-Flight Verification
Run all local test suites and production builds across the four submodules:
```bash
# 1. Main Client App
cd d:\19.Website\Varsaka\varsaka-react
npm run build

# 2. Backoffice App
cd d:\19.Website\Varsaka\varsaka-admin
npm run build

# 3. Blogs & Intelligence
cd d:\19.Website\Varsaka\varsaka-blogs
npm run build

# 4. Invoicing Engine
cd d:\19.Website\Varsaka\invoice-generator
npm run build
```
*Acceptance Criteria: All 4 commands must exit with code 0.*

### Step 2: Database Migration Check
If schema changes are present in root SQL files (`setup_tables.sql`, `setup_security.sql`):
1. Execute queries in Supabase Staging environment first.
2. Verify foreign keys and RLS policies using `supabase db lint`.
3. Apply idempotent migration script to Production PostgreSQL instance.

### Step 3: Git Tagging & CI/CD Trigger
```bash
git checkout main
git pull origin main
git tag -a v2026.3.0 -m "Production release 2026.3.0"
git push origin v2026.3.0
```
*GitHub Actions automatically runs tests and deploys immutable build artifacts to Cloudflare/Netlify/Vercel.*

### Step 4: Post-Deployment Smoke Test
1. Access `https://varsaka.com/` and verify hero renders cleanly.
2. Navigate to `https://varsaka.com/verify/VAR-INT-2026-002` and ensure certificate renders with authentic QR code.
3. Submit a test inquiry with consent checked to ensure delivery to `info@varsaka.com`.

---

## 2. Emergency Rollback Runbook (Under 60 Seconds)

If a critical P0 defect is detected post-deployment:
1. **Netlify / Vercel Webhook / Dashboard Rollback**:
   - Navigate to Deployments tab.
   - Click "Revert to Previous Production Release".
   - Confirm instant atomic switch.
2. **Git Revert**:
   ```bash
   git revert HEAD --no-edit
   git push origin main
   ```
3. Edge CDN cache is automatically flushed; previous deployment begins serving immediately.
