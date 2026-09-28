import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL
    }
  }
});

async function main() {
  const logs = await prisma.$queryRawUnsafe(`
    SELECT id, actor_email, action, target_id, ip_address, status, metadata, created_at
    FROM public.security_logs
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.log('Recent security_logs:\n', JSON.stringify(logs, null, 2));

  // Reset our test IP so we don't have failed attempts
  await prisma.$executeRawUnsafe(`
    UPDATE "IpBlock"
    SET "failedAttempts" = 0, "blockedUntil" = NULL
    WHERE ip = '103.172.202.192'
  `);
  console.log('Cleaned test IP attempts.');
}

main().finally(() => prisma.$disconnect());
