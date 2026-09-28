import { DB_URL } from './db_env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

async function main() {
  console.log('🚀 Applying Services Schema SQL Migration...');
  const sqlFile = path.resolve('expand_services_schema.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Split SQL statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`✓ [${i + 1}/${statements.length}] Executed statement successfully`);
    } catch (err) {
      console.error(`✗ [${i + 1}/${statements.length}] Failed executing:`, stmt.substring(0, 80));
      console.error('Error:', err.message);
      throw err;
    }
  }

  console.log('🎉 Services Schema Migration applied successfully!');

  // Verify columns now in services
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'services' 
    ORDER BY ordinal_position;
  `);
  console.log('Updated services columns:');
  console.table(cols);

  // Check existing records
  const rows = await prisma.$queryRawUnsafe(`SELECT id, name, slug, icon, status FROM public.services;`);
  console.log('Updated services rows:');
  console.table(rows);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
