-- Drop existing table if it was created wrongly before
DROP TABLE IF EXISTS "IpBlock";

-- Create the new IpBlock table
CREATE TABLE "IpBlock" (
  "id" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "app" TEXT NOT NULL,
  "failedAttempts" INTEGER NOT NULL DEFAULT 0,
  "blockedUntil" TIMESTAMP(3),
  "isPermanent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IpBlock_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint
CREATE UNIQUE INDEX "IpBlock_ip_app_key" ON "IpBlock"("ip", "app");

-- Enable RLS but allow anyone to read/write via RPC
ALTER TABLE "IpBlock" ENABLE ROW LEVEL SECURITY;

-- Create function to log failed attempt
CREATE OR REPLACE FUNCTION log_failed_attempt(p_ip TEXT, p_app TEXT)
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
    INSERT INTO "IpBlock" (id, ip, app, "failedAttempts", "updatedAt")
    VALUES (gen_random_uuid()::text, p_ip, p_app, 1, CURRENT_TIMESTAMP);
  ELSE
    -- Increment attempts
    v_attempts := v_attempts + 1;
    
    IF v_attempts >= 3 THEN
      -- Block for 24 hours
      UPDATE "IpBlock"
      SET "failedAttempts" = v_attempts,
          "blockedUntil" = CURRENT_TIMESTAMP + INTERVAL '24 hours',
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_id;
    ELSE
      -- Just update attempts
      UPDATE "IpBlock"
      SET "failedAttempts" = v_attempts,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_id;
    END IF;
  END IF;
END;
$$;

-- Create function to check if blocked
CREATE OR REPLACE FUNCTION check_ip_block(p_ip TEXT, p_app TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_blocked BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN "isPermanent" = true THEN true
      WHEN "blockedUntil" IS NOT NULL AND "blockedUntil" > CURRENT_TIMESTAMP THEN true
      ELSE false
    END INTO v_is_blocked
  FROM "IpBlock"
  WHERE ip = p_ip AND app = p_app;

  RETURN COALESCE(v_is_blocked, false);
END;
$$;

-- Create function to clear block on successful login
CREATE OR REPLACE FUNCTION clear_ip_block(p_ip TEXT, p_app TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE "IpBlock"
  SET "failedAttempts" = 0,
      "blockedUntil" = NULL,
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE ip = p_ip AND app = p_app AND "isPermanent" = false;
END;
$$;
