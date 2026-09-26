# Varsaka Disaster Recovery & Business Continuity Plan

**Lead Architect:** DevOps and Infrastructure Lead  
**Classification:** Operational Continuity Standard  
**Recovery Objectives:**
- **Recovery Time Objective (RTO)**: < 15 Minutes
- **Recovery Point Objective (RPO)**: < 60 Seconds (Point-in-Time WAL Streaming)  

---

## 1. Disaster Recovery Scenarios & Playbooks

### Scenario A: Supabase Primary Database Region Outage (Mumbai `ap-south-1`)
1. **Detection**: Cloudflare health probe detects consecutive 502/504 errors on database RPC calls.
2. **Playbook**:
   - Access Supabase Management Console -> Disaster Recovery.
   - Initiate Point-in-Time Recovery to standby replica in secondary AWS region (`ap-southeast-1` / Singapore).
   - Update `VITE_SUPABASE_URL` edge environment secret in Cloudflare/Netlify dashboard.
   - Re-deploy edge containers (takes ~90 seconds).
   - Service restored.

### Scenario B: Accidental Table Dropped or Corrupted Data
1. **Playbook**:
   - Identify precise timestamp prior to corruption event (`T_error`).
   - Use Supabase Point-in-Time Recovery (PITR) to restore database state to `T_error - 1 minute`.
   - Re-run missing benign transactions from application event logs.

### Scenario C: Compromise of API Credentials / Environment Secret Leak
1. **Playbook**:
   - Immediately rotate `SUPABASE_SERVICE_ROLE_KEY` and JWT Signing Secret in Supabase dashboard.
   - Force global logout of all active sessions (`auth.sessions` invalidated).
   - Update edge secrets in hosting provider.
   - Inspect database audit logs for unauthorized write operations during compromise window.
   - Notify CERT-In within 6 hours as mandated by Indian cybersecurity regulations.

---

## 2. Backup Verification Cadence
- **Automated Snapshots**: Daily at 02:00 UTC.
- **WAL Archival**: Continuous.
- **Restoration Drills**: Simulated restore conducted semi-annually into an isolated staging schema to guarantee backup validity.
