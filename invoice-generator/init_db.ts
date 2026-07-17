import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Supabase RPC functions...");
  
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION log_failed_attempt(p_ip TEXT, p_app TEXT)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_attempts INTEGER;
      v_id TEXT;
    BEGIN
      SELECT id, "failedAttempts" INTO v_id, v_attempts
      FROM "IpBlock"
      WHERE ip = p_ip AND app = p_app;

      IF v_id IS NULL THEN
        INSERT INTO "IpBlock" (id, ip, app, "failedAttempts", "updatedAt")
        VALUES (gen_random_uuid()::text, p_ip, p_app, 1, CURRENT_TIMESTAMP);
      ELSE
        v_attempts := v_attempts + 1;
        IF v_attempts >= 3 THEN
          UPDATE "IpBlock"
          SET "failedAttempts" = v_attempts,
              "blockedUntil" = CURRENT_TIMESTAMP + INTERVAL '24 hours',
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = v_id;
        ELSE
          UPDATE "IpBlock"
          SET "failedAttempts" = v_attempts,
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = v_id;
        END IF;
      END IF;
    END;
    $$;
  `);

  await prisma.$executeRawUnsafe(`
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
  `);

  await prisma.$executeRawUnsafe(`
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
  `);

  console.log("RPC functions created successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
