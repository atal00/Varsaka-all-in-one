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
  try {
    const ipBlockCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'IpBlock'
    `);
    console.log('IpBlock columns:', ipBlockCols);

    const secLogsCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'security_logs'
    `);
    console.log('security_logs columns:', secLogsCols);

    const ipRows = await prisma.$queryRawUnsafe(`SELECT * FROM "IpBlock" LIMIT 10`);
    console.log('IpBlock sample rows:', ipRows);

    const secRows = await prisma.$queryRawUnsafe(`SELECT * FROM public.security_logs ORDER BY created_at DESC LIMIT 5`);
    console.log('security_logs count:', secRows.length, 'sample:', secRows);
  } catch (err) {
    console.error('ERROR inspecting schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
