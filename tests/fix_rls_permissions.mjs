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
  console.log('Fixing RLS policies and grants for anon role...');

  const statements = [
    `GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated, public;`,
    `GRANT EXECUTE ON FUNCTION has_module_permission(text, text) TO anon, authenticated, public;`,
    
    // Case studies policies
    `DROP POLICY IF EXISTS "Public can view published case studies" ON case_studies;`,
    `DROP POLICY IF EXISTS "Authorized users can view case_studies" ON case_studies;`,
    `DROP POLICY IF EXISTS "Allow public read case_studies" ON case_studies;`,
    `DROP POLICY IF EXISTS "Public read published case studies" ON case_studies;`,
    `DROP POLICY IF EXISTS "Authenticated read case studies" ON case_studies;`,
    
    `CREATE POLICY "Public read published case studies" ON case_studies
      FOR SELECT TO anon
      USING (status = 'published');`,

    `CREATE POLICY "Authenticated read case studies" ON case_studies
      FOR SELECT TO authenticated
      USING (status = 'published' OR is_admin() OR has_module_permission('case_studies', 'view'));`,

    // Blogs policies
    `DROP POLICY IF EXISTS "Authorized users can view blogs" ON blogs;`,
    `DROP POLICY IF EXISTS "Allow public read blogs" ON blogs;`,
    `DROP POLICY IF EXISTS "Public read published blogs" ON blogs;`,
    `DROP POLICY IF EXISTS "Authenticated read blogs" ON blogs;`,

    `CREATE POLICY "Public read published blogs" ON blogs
      FOR SELECT TO anon
      USING (status = 'published');`,

    `CREATE POLICY "Authenticated read blogs" ON blogs
      FOR SELECT TO authenticated
      USING (status = 'published' OR is_admin() OR has_module_permission('blog', 'view'));`
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('✓ Executed:', sql.split('\n')[0]);
    } catch (err) {
      console.error('Error executing:', sql.split('\n')[0], err.message);
    }
  }

  console.log('All RLS grants and policies updated successfully.');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
