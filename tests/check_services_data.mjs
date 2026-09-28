import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT id, name, slug, icon, status, category, tags, capabilities, process_steps, metrics 
    FROM public.services;
  `);
  console.log('Services in DB:');
  console.dir(rows, { depth: null });
  await prisma.$disconnect();
}

main().catch(console.error);
