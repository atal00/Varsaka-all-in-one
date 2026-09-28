const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding performance indexes to PostgreSQL...');

  const queries = [
    `CREATE INDEX IF NOT EXISTS "idx_invoice_userid" ON "Invoice"("userId");`,
    `CREATE INDEX IF NOT EXISTS "idx_invoice_userid_status" ON "Invoice"("userId", "status");`,
    `CREATE INDEX IF NOT EXISTS "idx_invoice_userid_createdat" ON "Invoice"("userId", "createdAt" DESC);`,
    `CREATE INDEX IF NOT EXISTS "idx_lineitem_invoiceid" ON "LineItem"("invoiceId");`,
    `CREATE INDEX IF NOT EXISTS "idx_client_userid" ON "Client"("userId");`
  ];

  for (const q of queries) {
    console.log('Executing:', q);
    await prisma.$executeRawUnsafe(q);
  }

  const indexes = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'Invoice' AND schemaname = current_schema();
  `;
  console.log('Updated indexes on Invoice table:', indexes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
