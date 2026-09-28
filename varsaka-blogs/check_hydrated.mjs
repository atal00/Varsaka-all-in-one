import { PrismaClient } from './node_modules/@prisma/client/index.js';
import { hydrateTopic } from './src/lib/topic-hydration.ts';

const prisma = new PrismaClient();

async function run() {
  const topics = await prisma.topic.findMany({ orderBy: { createdAt: 'desc' } });
  console.log('Total topics in DB:', topics.length);
  const hydrated = topics.map(hydrateTopic);
  hydrated.slice(0, 6).forEach(t => {
    console.log(`\nTopic: "${t.name}"`);
    console.log(`  Trend Score: ${t.trendScore}/100 (Rec: ${t.scoreBreakdown?.recency}, Mom: ${t.scoreBreakdown?.momentum}, Cross: ${t.scoreBreakdown?.crossSourceConfirmation}, Nov: ${t.scoreBreakdown?.novelty})`);
    console.log(`  Varsaka Relevance: ${t.varsakaRelevance?.score}/100 [${(t.varsakaRelevance?.matchedDomains || []).join(', ')}]`);
    console.log(`  Freshness: ${t.freshnessLabel}`);
    console.log(`  Content Opportunities: Blog=${t.contentOpportunity?.blog}, CaseStudy=${t.contentOpportunity?.caseStudy}, Research=${t.contentOpportunity?.research}`);
    console.log(`  Sources: ${t.sourcesCount} verified references`);
    if (t.sources[0]) {
      console.log(`    Ref 1: "${t.sources[0].title}" (${t.sources[0].source}) -> ${t.sources[0].sourceUrl}`);
    }
  });
  await prisma.$disconnect();
}

run();
