import { PrismaClient } from './node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function checkPages() {
  const a = await prisma.article.findFirst({ orderBy: { createdAt: 'desc' } });
  const cs = await prisma.caseStudy.findFirst({ orderBy: { createdAt: 'desc' } });
  const r = await prisma.research.findFirst({ orderBy: { createdAt: 'desc' } });

  console.log('Article ID:', a?.id);
  const rA = await fetch(`http://localhost:3001/dashboard/articles/${a?.id}`);
  console.log('Article page status:', rA.status);

  console.log('Case study ID:', cs?.id);
  const rCS = await fetch(`http://localhost:3001/dashboard/case-studies/${cs?.id}`);
  console.log('Case study page status:', rCS.status);

  console.log('Research ID:', r?.id);
  const rR = await fetch(`http://localhost:3001/dashboard/research/${r?.id}`);
  console.log('Research page status:', rR.status);

  await prisma.$disconnect();
}

checkPages();
