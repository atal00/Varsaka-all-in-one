import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

async function main() {
  try {
    const svcCols = await prisma.$queryRawUnsafe(`
      SELECT table_schema, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      ORDER BY ordinal_position;
    `);
    console.log('SERVICES COLUMNS:');
    console.table(svcCols);

    const existingServices = await prisma.$queryRawUnsafe(`SELECT * FROM public.services;`);
    console.log('EXISTING SERVICES COUNT:', existingServices.length);
    console.log(JSON.stringify(existingServices, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
