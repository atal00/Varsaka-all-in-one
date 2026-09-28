const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Benchmarking Database Queries ---');

  // Find invoice admin user
  const user = await prisma.user.findUnique({ where: { email: 'invoice@varsaka.com' } });
  if (!user) {
    console.log('No user found');
    return;
  }
  const userId = user.id;
  console.log('Testing for user:', user.email, `(${userId})`);

  // 1. BEFORE: Full findMany with lineItems
  console.time('1. BEFORE: Full findMany with lineItems');
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    include: { lineItems: true },
    orderBy: { createdAt: 'desc' }
  });
  console.timeEnd('1. BEFORE: Full findMany with lineItems');
  console.log('Invoices retrieved:', invoices.length);

  // JS calculation:
  const totalRevenueBefore = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);
  const totalOutstandingBefore = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Sent').reduce((acc, inv) => acc + inv.total, 0);
  const totalCountBefore = invoices.length;

  console.log('Calculated before:', {
    totalRevenue: totalRevenueBefore,
    totalOutstanding: totalOutstandingBefore,
    totalCount: totalCountBefore
  });

  // 2. AFTER: Database groupBy aggregation + selective 5 recent invoices
  console.time('2. AFTER: Parallel groupBy + selective recent invoices');
  const [metricsGroup, recent] = await Promise.all([
    prisma.invoice.groupBy({
      by: ['status'],
      where: { userId },
      _sum: { total: true },
      _count: { _all: true }
    }),
    prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        issueDate: true,
        status: true,
        currency: true,
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);
  console.timeEnd('2. AFTER: Parallel groupBy + selective recent invoices');

  let totalRevenueAfter = 0;
  let totalOutstandingAfter = 0;
  let totalCountAfter = 0;

  for (const group of metricsGroup) {
    const count = group._count._all || 0;
    const sum = group._sum.total || 0;
    totalCountAfter += count;
    if (group.status === 'Paid') {
      totalRevenueAfter += sum;
    } else if (group.status === 'Pending' || group.status === 'Overdue' || group.status === 'Sent') {
      totalOutstandingAfter += sum;
    }
  }

  console.log('Calculated after:', {
    totalRevenue: totalRevenueAfter,
    totalOutstanding: totalOutstandingAfter,
    totalCount: totalCountAfter
  });

  // Mathematical verification:
  const mathMatches = (
    Math.abs(totalRevenueBefore - totalRevenueAfter) < 0.001 &&
    Math.abs(totalOutstandingBefore - totalOutstandingAfter) < 0.001 &&
    totalCountBefore === totalCountAfter
  );
  console.log('Mathematical correctness matches 100%:', mathMatches);

  // Check indexes on Invoice table:
  const indexes = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'Invoice' AND schemaname = current_schema();
  `;
  console.log('Existing indexes on Invoice table:', indexes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
