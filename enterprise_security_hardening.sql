-- =========================================================================
-- Varsaka Labs Enterprise Security Hardening
-- Admin Authentication, Server-Side IP Blocking, Audit Trail & RBAC
-- =========================================================================

-- 1. Security Settings Configuration Table
CREATE TABLE IF NOT EXISTS public.security_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  failed_attempt_threshold INTEGER NOT NULL DEFAULT 5,
  initial_block_minutes INTEGER NOT NULL DEFAULT 15,
  progressive_multiplier INTEGER NOT NULL DEFAULT 4,
  max_block_minutes INTEGER NOT NULL DEFAULT 1440,
  account_lock_threshold INTEGER NOT NULL DEFAULT 10,
  account_lock_minutes INTEGER NOT NULL DEFAULT 30,
  mfa_enforced_for_admins BOOLEAN NOT NULL DEFAULT false,
  session_timeout_minutes INTEGER NOT NULL DEFAULT 480,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_by TEXT DEFAULT 'system'
);

INSERT INTO public.security_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_settings FROM anon, public;
GRANT SELECT ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;

DROP POLICY IF EXISTS "Authenticated can read security settings" ON public.security_settings;
CREATE POLICY "Authenticated can read security settings" ON public.security_settings
  FOR SELECT TO authenticated USING (true);

-- 2. IP Firewall ("IpBlock") Schema Hardening
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "blockType" TEXT DEFAULT 'automatic';
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "reason" TEXT;
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "firstSeen" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "blockedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "createdBy" TEXT DEFAULT 'system';
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "lastAction" TEXT DEFAULT 'none';
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "abuseCount" INTEGER DEFAULT 0;

-- Crucial Security Hardening: Never store passwords in the database
ALTER TABLE "IpBlock" DROP COLUMN IF EXISTS "lastAttemptedPass";

-- Performance & Scaling Indexes for IP Firewall
CREATE INDEX IF NOT EXISTS "idx_ipblock_ip_app" ON "IpBlock"("ip", "app");
CREATE INDEX IF NOT EXISTS "idx_ipblock_blockedUntil" ON "IpBlock"("blockedUntil");
CREATE INDEX IF NOT EXISTS "idx_ipblock_isPermanent" ON "IpBlock"("isPermanent");

-- 3. Security Logs Table Enhancements & Append-Only Tamper Protection
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS request_id TEXT;
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';
ALTER TABLE public.security_logs ADD COLUMN IF NOT EXISTS actor_role TEXT;

CREATE INDEX IF NOT EXISTS "idx_security_logs_created_at" ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS "idx_security_logs_action" ON public.security_logs(action);
CREATE INDEX IF NOT EXISTS "idx_security_logs_ip_address" ON public.security_logs(ip_address);
CREATE INDEX IF NOT EXISTS "idx_security_logs_actor_email" ON public.security_logs(actor_email);
CREATE INDEX IF NOT EXISTS "idx_security_logs_status" ON public.security_logs(status);

-- Enforce strict append-only security: No client can ever UPDATE or DELETE audit logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_logs FROM anon, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.security_logs FROM authenticated;
GRANT SELECT ON public.security_logs TO authenticated;

DROP POLICY IF EXISTS "Staff with view permission can read security logs" ON public.security_logs;
CREATE POLICY "Staff with view permission can read security logs" ON public.security_logs
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    public.has_module_permission('security_logs', 'view')
  );

-- 4. Enhance Profiles for Temporary Security Access & Roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS temporary_access_expires_at TIMESTAMP WITH TIME ZONE;

-- 5. Updated Granular Module Permission Checker with Temporary Access & Auditor Role
CREATE OR REPLACE FUNCTION public.has_module_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
STABLE
AS $$
DECLARE
  v_role TEXT;
  v_perms JSONB;
  v_temp_expires TIMESTAMPTZ;
BEGIN
  SELECT role, permissions, temporary_access_expires_at 
  INTO v_role, v_perms, v_temp_expires
  FROM public.profiles
  WHERE id = auth.uid();

  -- Administrators inherently possess universal unrestricted access
  IF LOWER(TRIM(v_role)) = 'admin' THEN
    RETURN true;
  END IF;

  -- Account-level disablement check
  IF COALESCE((v_perms->>'is_disabled')::boolean, false) = true THEN
    RETURN false;
  END IF;

  -- Check temporary access expiration
  IF v_temp_expires IS NOT NULL AND v_temp_expires < timezone('utc'::text, now()) THEN
    -- If user had a temporary security role that expired, deny access
    IF LOWER(TRIM(v_role)) = 'security_auditor' THEN
      RETURN false;
    END IF;
  END IF;

  -- Security Auditor role has view-only access to security_logs and dashboard
  IF LOWER(TRIM(v_role)) = 'security_auditor' THEN
    IF p_module = 'security_logs' AND p_action = 'view' THEN
      RETURN true;
    END IF;
    IF p_module = 'dashboard' AND p_action = 'view' THEN
      RETURN true;
    END IF;
    RETURN false;
  END IF;

  IF v_perms IS NULL THEN
    RETURN false;
  END IF;

  -- Check granular action permission
  RETURN COALESCE((v_perms->p_module->>p_action)::boolean, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_module_permission(TEXT, TEXT) TO authenticated;

-- 6. Helper to Extract Trusted Reverse Proxy IP Server-Side
CREATE OR REPLACE FUNCTION public.get_trusted_client_ip(p_fallback TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_headers JSONB;
  v_ip TEXT;
BEGIN
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    v_headers := '{}'::jsonb;
  END;

  -- Priority 1: Cloudflare Connecting IP
  v_ip := v_headers->>'cf-connecting-ip';
  
  -- Priority 2: Leftmost X-Forwarded-For IP
  IF v_ip IS NULL OR trim(v_ip) = '' THEN
    v_ip := split_part(v_headers->>'x-forwarded-for', ',', 1);
  END IF;

  -- Priority 3: Fallback parameter or 'Unknown'
  IF v_ip IS NULL OR trim(v_ip) = '' THEN
    v_ip := p_fallback;
  END IF;

  IF v_ip IS NULL OR trim(v_ip) = '' THEN
    v_ip := 'Unknown';
  END IF;

  RETURN trim(v_ip);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_trusted_client_ip(TEXT) TO anon, authenticated, service_role;

-- 7. Check IP Security Status RPC
CREATE OR REPLACE FUNCTION public.check_ip_security_status(p_ip TEXT, p_app TEXT DEFAULT 'admin')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trusted_ip TEXT;
  v_rec RECORD;
  v_remaining_sec INTEGER := 0;
  v_is_temp_blocked BOOLEAN := false;
  v_is_blocked BOOLEAN := false;
BEGIN
  v_trusted_ip := public.get_trusted_client_ip(p_ip);

  SELECT * INTO v_rec
  FROM "IpBlock"
  WHERE ip = v_trusted_ip AND app = p_app;

  IF v_rec.id IS NOT NULL THEN
    IF v_rec."isPermanent" = true THEN
      v_is_blocked := true;
      RETURN jsonb_build_object(
        'isBlocked', true,
        'isPermanent', true,
        'status', 'PERMANENTLY_BLOCKED',
        'reason', COALESCE(v_rec.reason, 'Permanently blocked by administrator'),
        'ip', v_trusted_ip,
        'failedAttempts', v_rec."failedAttempts"
      );
    ELSIF v_rec."blockedUntil" IS NOT NULL AND v_rec."blockedUntil" > timezone('utc'::text, now()) THEN
      v_is_blocked := true;
      v_is_temp_blocked := true;
      v_remaining_sec := GREATEST(0, EXTRACT(EPOCH FROM (v_rec."blockedUntil" - timezone('utc'::text, now())))::integer);
      
      RETURN jsonb_build_object(
        'isBlocked', true,
        'isPermanent', false,
        'status', 'TEMPORARILY_BLOCKED',
        'blockedUntil', v_rec."blockedUntil",
        'remainingSeconds', v_remaining_sec,
        'reason', COALESCE(v_rec.reason, 'Excessive failed login attempts'),
        'ip', v_trusted_ip,
        'failedAttempts', v_rec."failedAttempts"
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'isBlocked', false,
    'isPermanent', false,
    'status', 'ACTIVE',
    'ip', v_trusted_ip,
    'failedAttempts', COALESCE(v_rec."failedAttempts", 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_ip_security_status(TEXT, TEXT) TO anon, authenticated, service_role;

-- 8. Server-Side Login Attempt Tracking & Progressive IP Blocking RPC
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_ip TEXT,
  p_app TEXT,
  p_username TEXT,
  p_success BOOLEAN,
  p_user_agent TEXT DEFAULT NULL,
  p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trusted_ip TEXT;
  v_cfg RECORD;
  v_rec RECORD;
  v_id TEXT;
  v_attempts INTEGER := 0;
  v_abuse_count INTEGER := 0;
  v_block_minutes INTEGER := 15;
  v_blocked_until TIMESTAMPTZ := NULL;
  v_actor_id UUID;
  v_actor_email TEXT;
  v_masked_user TEXT;
  v_user_agent TEXT;
BEGIN
  v_trusted_ip := public.get_trusted_client_ip(p_ip);

  -- Safe username masking for audit trail without leaking passwords
  IF p_username IS NOT NULL AND length(trim(p_username)) > 0 THEN
    IF position('@' in p_username) > 0 THEN
      v_masked_user := substring(p_username from 1 for 3) || '***@' || split_part(p_username, '@', 2);
    ELSE
      v_masked_user := substring(p_username from 1 for 3) || '***';
    END IF;
  ELSE
    v_masked_user := 'anonymous';
  END IF;

  -- Load security settings
  SELECT * INTO v_cfg FROM public.security_settings WHERE id = 'default';
  IF v_cfg.id IS NULL THEN
    v_cfg.failed_attempt_threshold := 5;
    v_cfg.initial_block_minutes := 15;
    v_cfg.progressive_multiplier := 4;
    v_cfg.max_block_minutes := 1440;
  END IF;

  -- Find existing IP record
  SELECT * INTO v_rec
  FROM "IpBlock"
  WHERE ip = v_trusted_ip AND app = p_app;

  -- Retrieve actor context if already authenticated
  v_actor_id := auth.uid();
  IF v_actor_id IS NOT NULL THEN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = v_actor_id;
  ELSE
    v_actor_email := p_username;
  END IF;

  v_user_agent := COALESCE(p_user_agent, current_setting('request.headers', true)::jsonb->>'user-agent', 'Unknown');

  -- =========================================================================
  -- CASE A: SUCCESSFUL LOGIN
  -- =========================================================================
  IF p_success = true THEN
    IF v_rec.id IS NOT NULL THEN
      -- If not permanently blocked, reset failed attempts counter
      IF v_rec."isPermanent" = false THEN
        UPDATE "IpBlock"
        SET "failedAttempts" = 0,
            "blockedUntil" = NULL,
            "lastSeen" = timezone('utc'::text, now()),
            "lastAction" = 'login_cleared',
            "updatedAt" = timezone('utc'::text, now())
        WHERE id = v_rec.id;
      END IF;
    END IF;

    -- Record LOGIN_SUCCESS in audit trail
    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'login_success',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'success',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'event', 'LOGIN_SUCCESS'
      ),
      timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
      'status', 'ok',
      'isBlocked', false,
      'ip', v_trusted_ip
    );
  END IF;

  -- =========================================================================
  -- CASE B: FAILED LOGIN ATTEMPT
  -- =========================================================================
  -- Check if already permanently blocked
  IF v_rec.id IS NOT NULL AND v_rec."isPermanent" = true THEN
    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'login_blocked',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'blocked',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'reason', 'Attempt from permanently blocked IP',
        'event', 'LOGIN_BLOCKED'
      ),
      timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
      'status', 'blocked',
      'isBlocked', true,
      'isPermanent', true,
      'reason', 'Access permanently blocked',
      'ip', v_trusted_ip
    );
  END IF;

  -- Check if already temporarily blocked
  IF v_rec.id IS NOT NULL AND v_rec."blockedUntil" IS NOT NULL AND v_rec."blockedUntil" > timezone('utc'::text, now()) THEN
    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'login_blocked',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'blocked',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'reason', 'Attempt while temporarily blocked',
        'blockedUntil', v_rec."blockedUntil",
        'event', 'LOGIN_BLOCKED'
      ),
      timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
      'status', 'blocked',
      'isBlocked', true,
      'isPermanent', false,
      'blockedUntil', v_rec."blockedUntil",
      'remainingSeconds', GREATEST(0, EXTRACT(EPOCH FROM (v_rec."blockedUntil" - timezone('utc'::text, now())))::integer),
      'reason', 'Access temporarily blocked',
      'ip', v_trusted_ip
    );
  END IF;

  -- Increment failed attempts
  IF v_rec.id IS NULL THEN
    v_attempts := 1;
    v_abuse_count := 0;
    v_id := gen_random_uuid()::text;

    INSERT INTO "IpBlock" (
      id, ip, app, "failedAttempts", "abuseCount", "blockType",
      "firstSeen", "lastSeen", "lastAction", "createdAt", "updatedAt"
    ) VALUES (
      v_id, v_trusted_ip, p_app, 1, 0, 'automatic',
      timezone('utc'::text, now()), timezone('utc'::text, now()), 'attempt_logged',
      timezone('utc'::text, now()), timezone('utc'::text, now())
    );
  ELSE
    v_id := v_rec.id;
    v_attempts := v_rec."failedAttempts" + 1;
    v_abuse_count := COALESCE(v_rec."abuseCount", 0);
  END IF;

  -- 🛡️ FAILED ATTEMPT POLICY:
  -- Attempt 1-4: Normal failure, record LOGIN_FAILED
  -- Attempt 5+: Block IP temporarily with progressive duration, record SECURITY_IP_BLOCKED and LOGIN_BLOCKED
  IF v_attempts >= v_cfg.failed_attempt_threshold THEN
    v_abuse_count := v_abuse_count + 1;
    
    -- Progressive backoff formula: initial * (multiplier ^ (abuseCount - 1)) capped at max
    v_block_minutes := v_cfg.initial_block_minutes * POWER(v_cfg.progressive_multiplier, GREATEST(0, v_abuse_count - 1));
    IF v_block_minutes > v_cfg.max_block_minutes THEN
      v_block_minutes := v_cfg.max_block_minutes;
    END IF;

    v_blocked_until := timezone('utc'::text, now()) + (v_block_minutes || ' minutes')::interval;

    UPDATE "IpBlock"
    SET "failedAttempts" = v_attempts,
        "abuseCount" = v_abuse_count,
        "blockedUntil" = v_blocked_until,
        "blockedAt" = timezone('utc'::text, now()),
        "blockType" = 'automatic',
        "reason" = 'Automatic progressive block: ' || v_attempts || ' consecutive failed login attempts',
        "lastAction" = 'auto_blocked',
        "lastSeen" = timezone('utc'::text, now()),
        "updatedAt" = timezone('utc'::text, now())
    WHERE id = v_id;

    -- Record SECURITY_IP_BLOCKED in security_logs
    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'security_ip_blocked',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'blocked',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'failedAttempts', v_attempts,
        'blockMinutes', v_block_minutes,
        'blockedUntil', v_blocked_until,
        'abuseCount', v_abuse_count,
        'event', 'SECURITY_IP_BLOCKED'
      ),
      timezone('utc'::text, now())
    );

    -- Also record LOGIN_BLOCKED
    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'login_blocked',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'blocked',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'reason', 'IP blocked after ' || v_attempts || ' failed attempts',
        'event', 'LOGIN_BLOCKED'
      ),
      timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
      'status', 'blocked',
      'isBlocked', true,
      'isPermanent', false,
      'durationMinutes', v_block_minutes,
      'blockedUntil', v_blocked_until,
      'remainingSeconds', v_block_minutes * 60,
      'reason', 'Too many failed login attempts. Access temporarily restricted.',
      'ip', v_trusted_ip
    );
  ELSE
    -- Attempts 1–4: Record LOGIN_FAILED
    UPDATE "IpBlock"
    SET "failedAttempts" = v_attempts,
        "lastSeen" = timezone('utc'::text, now()),
        "lastAction" = 'attempt_logged',
        "updatedAt" = timezone('utc'::text, now())
    WHERE id = v_id;

    INSERT INTO public.security_logs (
      actor_id,
      actor_email,
      action,
      target_id,
      ip_address,
      user_agent,
      request_id,
      status,
      metadata,
      created_at
    ) VALUES (
      v_actor_id,
      COALESCE(v_actor_email, p_username),
      'login_failed',
      v_trusted_ip,
      v_trusted_ip,
      v_user_agent,
      p_request_id,
      'failure',
      jsonb_build_object(
        'app', p_app,
        'username', v_masked_user,
        'failedAttempts', v_attempts,
        'attemptsRemaining', (v_cfg.failed_attempt_threshold - v_attempts),
        'reason', 'Invalid credentials or security check',
        'event', 'LOGIN_FAILED'
      ),
      timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
      'status', 'failed',
      'isBlocked', false,
      'attempts', v_attempts,
      'attemptsRemaining', (v_cfg.failed_attempt_threshold - v_attempts),
      'ip', v_trusted_ip
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_login_attempt(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated, service_role;

-- 9. Admin Manual IP Block RPC (Supports Permanent & Temporary Blocks)
CREATE OR REPLACE FUNCTION public.admin_block_ip(
  p_ip TEXT,
  p_app TEXT,
  p_permanent BOOLEAN,
  p_duration_minutes INT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_email TEXT;
  v_is_admin BOOLEAN;
  v_has_perm BOOLEAN;
  v_action TEXT;
  v_blocked_until TIMESTAMPTZ := NULL;
  v_rec RECORD;
  v_id TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to block IP addresses';
  END IF;

  v_is_admin := public.is_admin();
  v_has_perm := public.has_module_permission('security_logs', 'edit') OR public.has_module_permission('security_ip', 'block');

  IF NOT (v_is_admin OR v_has_perm) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to manage IP firewall';
  END IF;

  IF p_permanent = true AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied: Permanent IP blocks require administrator privileges';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = v_caller_id;

  IF p_permanent = true THEN
    v_action := 'ip_permanently_blocked';
    v_blocked_until := NULL;
  ELSE
    v_action := 'ip_blocked';
    v_blocked_until := timezone('utc'::text, now()) + (COALESCE(p_duration_minutes, 1440) || ' minutes')::interval;
  END IF;

  SELECT * INTO v_rec FROM "IpBlock" WHERE ip = p_ip AND app = p_app;

  IF v_rec.id IS NULL THEN
    v_id := gen_random_uuid()::text;
    INSERT INTO "IpBlock" (
      id, ip, app, "failedAttempts", "isPermanent", "blockedUntil",
      "blockType", "reason", "firstSeen", "lastSeen", "blockedAt",
      "createdBy", "lastAction", "createdAt", "updatedAt"
    ) VALUES (
      v_id, p_ip, p_app, 5, p_permanent, v_blocked_until,
      'manual', p_reason, timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now()),
      COALESCE(v_caller_email, 'admin'), CASE WHEN p_permanent THEN 'permanent_blocked' ELSE 'manual_blocked' END,
      timezone('utc'::text, now()), timezone('utc'::text, now())
    );
  ELSE
    v_id := v_rec.id;
    UPDATE "IpBlock"
    SET "isPermanent" = p_permanent,
        "blockedUntil" = v_blocked_until,
        "blockType" = 'manual',
        "reason" = p_reason,
        "blockedAt" = timezone('utc'::text, now()),
        "createdBy" = COALESCE(v_caller_email, 'admin'),
        "lastAction" = CASE WHEN p_permanent THEN 'permanent_blocked' ELSE 'manual_blocked' END,
        "updatedAt" = timezone('utc'::text, now())
    WHERE id = v_id;
  END IF;

  -- Record audit event in security_logs
  INSERT INTO public.security_logs (
    actor_id,
    actor_email,
    action,
    target_id,
    ip_address,
    status,
    metadata,
    created_at
  ) VALUES (
    v_caller_id,
    v_caller_email,
    v_action,
    p_ip,
    p_ip,
    'success',
    jsonb_build_object(
      'app', p_app,
      'isPermanent', p_permanent,
      'durationMinutes', p_duration_minutes,
      'reason', p_reason,
      'event', UPPER(v_action)
    ),
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'ip', p_ip,
    'isPermanent', p_permanent,
    'blockedUntil', v_blocked_until,
    'action', v_action
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_block_ip(TEXT, TEXT, BOOLEAN, INT, TEXT) TO authenticated;

-- 10. Admin IP Unblock RPC
CREATE OR REPLACE FUNCTION public.admin_unblock_ip(
  p_ip TEXT,
  p_app TEXT,
  p_reason TEXT DEFAULT 'Manually unblocked by administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_email TEXT;
  v_is_admin BOOLEAN;
  v_has_perm BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to unblock IP addresses';
  END IF;

  v_is_admin := public.is_admin();
  v_has_perm := public.has_module_permission('security_logs', 'edit') OR public.has_module_permission('security_ip', 'unblock');

  IF NOT (v_is_admin OR v_has_perm) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to unblock IP addresses';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = v_caller_id;

  UPDATE "IpBlock"
  SET "failedAttempts" = 0,
      "blockedUntil" = NULL,
      "isPermanent" = false,
      "lastAction" = 'unblocked',
      "reason" = p_reason,
      "updatedAt" = timezone('utc'::text, now())
  WHERE ip = p_ip AND app = p_app;

  -- Record IP_UNBLOCKED audit log
  INSERT INTO public.security_logs (
    actor_id,
    actor_email,
    action,
    target_id,
    ip_address,
    status,
    metadata,
    created_at
  ) VALUES (
    v_caller_id,
    v_caller_email,
    'ip_unblocked',
    p_ip,
    p_ip,
    'success',
    jsonb_build_object(
      'app', p_app,
      'reason', p_reason,
      'event', 'IP_UNBLOCKED'
    ),
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'ip', p_ip,
    'action', 'ip_unblocked'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_unblock_ip(TEXT, TEXT, TEXT) TO authenticated;

-- 11. Expanded Comprehensive Audit Logging RPC
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action text,
  p_target_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_email text;
  v_log_id uuid;
  v_is_admin boolean;
  v_client_ip text;
  v_user_agent text;
BEGIN
  -- Defensive authentication check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Comprehensive enterprise audit allowlist
  IF p_action NOT IN (
    'login_success',
    'login_failed',
    'login_blocked',
    'security_ip_blocked',
    'ip_blocked',
    'ip_unblocked',
    'ip_permanently_blocked',
    'account_locked',
    'account_unlocked',
    'mfa_success',
    'mfa_failed',
    'password_changed',
    'session_created',
    'session_revoked',
    'admin_logout',
    'admin_permission_changed',
    'employee_permission_changed',
    'permissions_changed',
    'user_permissions_changed',
    'user_role_changed',
    'user_disabled',
    'user_enabled',
    'user_created',
    'user_updated',
    'user_deleted',
    'security_settings_changed',
    'career_created',
    'career_updated',
    'career_deleted',
    'certificate_created',
    'certificate_deleted',
    'lead_assigned',
    'care_request_updated',
    'care_request_status_changed',
    'service_created',
    'service_updated',
    'service_deleted',
    'blog_created',
    'blog_updated',
    'blog_published',
    'blog_deleted',
    'case_study_created',
    'case_study_updated',
    'case_study_deleted',
    'testimonial_created',
    'testimonial_updated',
    'testimonial_approved',
    'testimonial_deleted',
    'faq_created',
    'faq_updated',
    'faq_deleted'
  ) THEN
    RAISE EXCEPTION 'Invalid or unsupported audit action: %', p_action;
  END IF;

  v_actor_id := auth.uid();
  v_is_admin := public.is_admin();

  -- Sensitive audit action authorization check
  IF p_action IN (
    'permissions_changed',
    'user_permissions_changed',
    'user_role_changed',
    'user_disabled',
    'user_enabled',
    'user_deleted',
    'admin_permission_changed',
    'security_settings_changed',
    'ip_permanently_blocked'
  ) THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Access denied: Action "%" requires administrator privileges', p_action;
    END IF;
  END IF;

  SELECT COALESCE(p.email, u.email::text)
  INTO v_actor_email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = v_actor_id;

  v_client_ip := public.get_trusted_client_ip(NULL);
  v_user_agent := COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', 'Unknown');

  INSERT INTO public.security_logs (
    actor_id,
    actor_email,
    action,
    target_id,
    ip_address,
    user_agent,
    status,
    metadata,
    created_at
  ) VALUES (
    v_actor_id,
    v_actor_email,
    p_action,
    p_target_id,
    v_client_ip,
    v_user_agent,
    'success',
    COALESCE(p_metadata, '{}'::jsonb),
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb) TO authenticated;

-- 12. Security Settings Update RPC (Administrator Only)
CREATE OR REPLACE FUNCTION public.update_security_settings(
  p_failed_attempt_threshold INT,
  p_initial_block_minutes INT,
  p_progressive_multiplier INT,
  p_max_block_minutes INT,
  p_mfa_enforced_for_admins BOOLEAN,
  p_session_timeout_minutes INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_email TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can update security settings';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = v_caller_id;

  UPDATE public.security_settings
  SET failed_attempt_threshold = COALESCE(p_failed_attempt_threshold, failed_attempt_threshold),
      initial_block_minutes = COALESCE(p_initial_block_minutes, initial_block_minutes),
      progressive_multiplier = COALESCE(p_progressive_multiplier, progressive_multiplier),
      max_block_minutes = COALESCE(p_max_block_minutes, max_block_minutes),
      mfa_enforced_for_admins = COALESCE(p_mfa_enforced_for_admins, mfa_enforced_for_admins),
      session_timeout_minutes = COALESCE(p_session_timeout_minutes, session_timeout_minutes),
      updated_at = timezone('utc'::text, now()),
      updated_by = COALESCE(v_caller_email, 'admin')
  WHERE id = 'default';

  -- Record audit event
  INSERT INTO public.security_logs (
    actor_id,
    actor_email,
    action,
    target_id,
    status,
    metadata,
    created_at
  ) VALUES (
    v_caller_id,
    v_caller_email,
    'security_settings_changed',
    'default',
    'success',
    jsonb_build_object(
      'threshold', p_failed_attempt_threshold,
      'initialBlockMinutes', p_initial_block_minutes,
      'progressiveMultiplier', p_progressive_multiplier,
      'maxBlockMinutes', p_max_block_minutes,
      'mfaEnforced', p_mfa_enforced_for_admins,
      'sessionTimeoutMinutes', p_session_timeout_minutes
    ),
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_security_settings(INT, INT, INT, INT, BOOLEAN, INT) TO authenticated;
