import { PrismaClient } from '@prisma/client';
import { 
  harvestMarketTrends, 
  processAndClusterTrends, 
  normalizeTopicKey 
} from './src/lib/trend-engine.ts';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Testing standalone harvesting and DB insertion...');
    const { items, sourcesCount } = await harvestMarketTrends();
    console.log(`Harvested ${items.length} items from ${sourcesCount} sources.`);

    const clusters = processAndClusterTrends(items);
    console.log(`Clustered ${clusters.length} unique topics.`);

    // Check DB
    const existingTopics = await prisma.topic.findMany();
    console.log('Current DB topics count:', existingTopics.length);

    // Let's test the deduplication cleanup logic
    const existingNameMap = new Map();
    const duplicatesToDelete = [];

    for (const t of existingTopics) {
      const key = normalizeTopicKey(t.name);
      if (existingNameMap.has(key)) {
        duplicatesToDelete.push(t.id);
      } else {
        existingNameMap.set(key, t);
      }
    }

    console.log('Found duplicates to delete:', duplicatesToDelete.length);
    for (const id of duplicatesToDelete) {
      await prisma.topic.delete({ where: { id } });
    }

    // Now insert top clusters
    const topClusters = clusters.slice(0, 15);
    const nowIso = new Date().toISOString();

    for (const cluster of topClusters) {
      const key = normalizeTopicKey(cluster.canonicalTopic);
      const existing = existingNameMap.get(key);

      const metadataJson = JSON.stringify({
        scoreBreakdown: cluster.scoreBreakdown,
        varsakaRelevance: cluster.varsakaRelevance,
        freshness: cluster.freshness,
        freshnessLabel: cluster.freshnessLabel,
        contentOpportunity: cluster.contentOpportunity,
        aliases: cluster.aliases,
        sources: cluster.sources,
        suggestedAngles: cluster.suggestedAngles,
        targetKeywords: cluster.targetKeywords,
        lastDiscovered: nowIso
      });

      if (existing) {
        await prisma.topic.update({
          where: { id: existing.id },
          data: {
            trendScore: cluster.trendScore,
            seoScore: cluster.varsakaRelevance.score,
            searchIntent: metadataJson,
            suggestedType: cluster.contentOpportunity.recommendedType,
            suggestedAudience: cluster.suggestedAngles[0]?.audience,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.topic.create({
          data: {
            name: cluster.canonicalTopic,
            trendScore: cluster.trendScore,
            seoScore: cluster.varsakaRelevance.score,
            competitionScore: 50,
            searchIntent: metadataJson,
            suggestedType: cluster.contentOpportunity.recommendedType,
            suggestedAudience: cluster.suggestedAngles[0]?.audience,
            status: 'DISCOVERED'
          }
        });
      }
    }

    const updatedTopics = await prisma.topic.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log('Final DB topics count:', updatedTopics.length);
    updatedTopics.forEach(t => {
      console.log(`- ${t.name} (Trend: ${t.trendScore}, Varsaka: ${t.seoScore}, Status: ${t.status})`);
    });

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
