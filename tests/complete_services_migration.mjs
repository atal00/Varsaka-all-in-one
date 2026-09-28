import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

async function run() {
  const missing = [
    'ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;',
    'ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hero_title TEXT;',
    'ALTER TABLE public.services ADD COLUMN IF NOT EXISTS overview JSONB DEFAULT \'{}\'::jsonb;',
    'ALTER TABLE public.services ADD COLUMN IF NOT EXISTS seo_title TEXT;',
    "UPDATE public.services SET slug = 'functional-testing', icon = '🧪' WHERE name ILIKE '%functional%';",
    "UPDATE public.services SET slug = 'security-testing', icon = '🔐' WHERE name ILIKE '%security%';",
    "UPDATE public.services SET slug = 'ai-powered-testing', icon = '🤖' WHERE name ILIKE '%ai%';"
  ];

  for (const q of missing) {
    await prisma.$executeRawUnsafe(q);
    console.log('Executed:', q);
  }

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'services' 
    ORDER BY ordinal_position;
  `);
  console.log('Services Columns:');
  console.table(cols);

  const rows = await prisma.$queryRawUnsafe(`SELECT id, name, slug, icon, status FROM public.services;`);
  console.log('Services with slugs and icons:');
  console.table(rows);

  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
