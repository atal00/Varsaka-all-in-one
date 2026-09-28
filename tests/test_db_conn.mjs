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
    const res = await prisma.$queryRawUnsafe('SELECT version()');
    console.log('SUCCESS! Database version:', res);
  } catch (err) {
    console.error('ERROR connecting to db:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
