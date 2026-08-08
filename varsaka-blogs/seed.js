const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: 'file:./dev.db' });

async function seed() {
  await prisma.topic.create({
    data: {
      name: 'AI in Healthcare',
      trendScore: 92,
      status: 'DISCOVERED'
    }
  });
  await prisma.topic.create({
    data: {
      name: 'Case Study: Fintech Security',
      trendScore: 85,
      status: 'RESEARCHING'
    }
  });
  await prisma.article.create({
    data: {
      title: 'The Future of AI in Healthcare',
      slug: 'future-ai-healthcare',
      content: 'This is a generated blog about AI in healthcare...',
      status: 'PUBLISHED',
      keywords: '[]'
    }
  });
  await prisma.caseStudy.create({
    data: {
      title: 'Fintech Security Overhaul',
      slug: 'fintech-security-overhaul',
      client: 'Ourfab Technologies',
      industry: 'Finance',
      content: 'Detailed case study content...',
      status: 'PUBLISHED'
    }
  });
  console.log('Seeded successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
