ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "lastAttemptedUser" TEXT;
ALTER TABLE "IpBlock" ADD COLUMN IF NOT EXISTS "lastAttemptedPass" TEXT;

CREATE OR REPLACE FUNCTION log_failed_attempt_v2(p_ip TEXT, p_app TEXT, p_user TEXT, p_pass TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INTEGER;
  v_id TEXT;
BEGIN
  -- Check if record exists
  SELECT id, "failedAttempts" INTO v_id, v_attempts
  FROM "IpBlock"
  WHERE ip = p_ip AND app = p_app;

  IF v_id IS NULL THEN
    -- Insert new
    INSERT INTO "IpBlock" (id, ip, app, "failedAttempts", "updatedAt", "lastAttemptedUser", "lastAttemptedPass")
    VALUES (gen_random_uuid()::text, p_ip, p_app, 1, CURRENT_TIMESTAMP, p_user, p_pass);
  ELSE
    -- Increment attempts
    v_attempts := v_attempts + 1;
    
    IF v_attempts >= 3 THEN
      -- Block for 24 hours
      UPDATE "IpBlock"
      SET "failedAttempts" = v_attempts,
          "blockedUntil" = CURRENT_TIMESTAMP + INTERVAL '24 hours',
          "updatedAt" = CURRENT_TIMESTAMP,
          "lastAttemptedUser" = p_user,
          "lastAttemptedPass" = p_pass
      WHERE id = v_id;
    ELSE
      -- Just update attempts
      UPDATE "IpBlock"
      SET "failedAttempts" = v_attempts,
          "updatedAt" = CURRENT_TIMESTAMP,
          "lastAttemptedUser" = p_user,
          "lastAttemptedPass" = p_pass
      WHERE id = v_id;
    END IF;
  END IF;
END;
$$;
