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
    const profCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
    `);
    console.log('profiles columns:', profCols);

    const profs = await prisma.$queryRawUnsafe(`SELECT id, email, role, permissions FROM public.profiles LIMIT 5`);
    console.log('sample profiles:', profs);
  } catch (err) {
    console.error('ERROR inspecting profiles:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
