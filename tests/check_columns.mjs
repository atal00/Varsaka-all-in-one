import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL
    }
  }
});

async function check() {
  const blogCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'blogs' 
    ORDER BY ordinal_position;
  `);
  console.log('BLOG COLUMNS:', blogCols);

  const csCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'case_studies' 
    ORDER BY ordinal_position;
  `);
  console.log('CASE STUDY COLUMNS:', csCols);

  const jobsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    ORDER BY ordinal_position;
  `);
  console.log('JOBS COLUMNS:', jobsCols);

  const blogs = await prisma.$queryRawUnsafe(`SELECT id, title, status FROM public.blogs LIMIT 2;`);
  console.log('EXISTING BLOGS:', blogs);

  const cs = await prisma.$queryRawUnsafe(`SELECT id, client, status FROM public.case_studies LIMIT 2;`);
  console.log('EXISTING CASE STUDIES:', cs);

  await prisma.$disconnect();
}

check().catch(console.error);
