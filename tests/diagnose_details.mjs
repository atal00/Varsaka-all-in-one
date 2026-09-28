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
  // 1. Columns of blogs
  const blogCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'blogs'
  `);
  console.log('blogs columns:', blogCols);

  // 2. Data in blogs
  const blogs = await prisma.$queryRawUnsafe(`SELECT * FROM blogs`);
  console.log(`blogs data (${blogs.length} rows):`, blogs);

  // 3. Columns & data in site_content
  try {
    const siteContent = await prisma.$queryRawUnsafe(`SELECT * FROM site_content`);
    console.log(`site_content data (${siteContent.length} rows):`, siteContent);
  } catch (e) {
    console.log('site_content error:', e.message);
  }

  // 4. Columns of case_studies
  const caseCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'case_studies'
  `);
  console.log('case_studies columns:', caseCols);

  // 6. Storage buckets
  try {
    const buckets = await prisma.$queryRawUnsafe('SELECT id, name, public FROM storage.buckets');
    console.log('STORAGE BUCKETS:', buckets);
  } catch (e) {
    console.log('Error querying storage.buckets:', e.message);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
