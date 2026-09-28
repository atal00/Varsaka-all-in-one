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
  console.log('=== DATABASE CMS INSPECTION ===');
  
  // 1. List all public tables
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('Public tables:', tables.map(t => t.table_name));

  // 2. Check faqs table
  try {
    const faqs = await prisma.$queryRawUnsafe(`SELECT * FROM faqs ORDER BY id ASC`);
    console.log(`\nFAQS (${faqs.length} records):`);
    console.log(faqs);
  } catch (e) {
    console.log('Error querying faqs:', e.message);
  }

  // 3. Check blogs table
  try {
    const blogs = await prisma.$queryRawUnsafe(`SELECT id, title, slug, published, created_at FROM blogs ORDER BY id ASC`);
    console.log(`\nBLOGS (${blogs.length} records):`);
    console.log(blogs);
  } catch (e) {
    console.log('Error querying blogs:', e.message);
  }

  // 4. Check case_studies table
  try {
    const caseStudies = await prisma.$queryRawUnsafe(`SELECT * FROM case_studies ORDER BY id ASC`);
    console.log(`\nCASE STUDIES (${caseStudies.length} records):`);
    console.log(caseStudies);
  } catch (e) {
    console.log('Error querying case_studies:', e.message);
  }

  // 5. Check testimonials / feedback tables
  try {
    const testimonials = await prisma.$queryRawUnsafe(`SELECT * FROM testimonials ORDER BY id ASC`);
    console.log(`\nTESTIMONIALS (${testimonials.length} records):`);
    console.log(testimonials);
  } catch (e) {
    console.log('Error querying testimonials:', e.message);
  }

  // 6. Check RLS policies on faqs, blogs, case_studies, testimonials
  const policies = await prisma.$queryRawUnsafe(`
    SELECT tablename, policyname, roles, cmd, qual 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('faqs', 'blogs', 'case_studies', 'testimonials')
    ORDER BY tablename, policyname;
  `);
  console.log('\nRLS POLICIES:', policies);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
