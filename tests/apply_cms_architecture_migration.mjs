import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL
    }
  }
});

async function migrate() {
  console.log('--- Applying CMS Architecture Expansion Migration ---');

  // Case Studies Table
  await prisma.$executeRawUnsafe(`
    ALTER TABLE case_studies 
    ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS engagement TEXT DEFAULT 'End-to-End QA Audit',
    ADD COLUMN IF NOT EXISTS verification TEXT DEFAULT '✓ Verified Results';
  `);
  console.log('✓ Added sections, engagement, verification to case_studies');

  // Blogs Table
  await prisma.$executeRawUnsafe(`
    ALTER TABLE blogs 
    ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS hero_alt TEXT,
    ADD COLUMN IF NOT EXISTS hero_caption TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS og_title TEXT,
    ADD COLUMN IF NOT EXISTS og_description TEXT,
    ADD COLUMN IF NOT EXISTS og_image TEXT;
  `);
  console.log('✓ Added sections, hero_alt, hero_caption, tags, is_featured, SEO/OG columns to blogs');

  console.log('Migration completed successfully.');
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
