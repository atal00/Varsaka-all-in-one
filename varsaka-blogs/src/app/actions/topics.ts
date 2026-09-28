'use server'

import prisma from '@/lib/prisma'
import { 
  harvestMarketTrends, 
  processAndClusterTrends, 
  DiscoveredTopicCluster,
  normalizeTopicKey
} from '@/lib/trend-engine'
import { revalidatePath } from 'next/cache'

import { hydrateTopic } from '@/lib/topic-hydration'

export async function getTopics() {
  try {
    const rawTopics = await prisma.topic.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // If database is empty or only has the old mock duplicates, auto-seed with real intelligence
    const hasOnlyOldMock = rawTopics.length > 0 && rawTopics.every(t => t.name === 'AI in Healthcare' || t.name === 'Case Study: Fintech Security')
    if (rawTopics.length === 0 || hasOnlyOldMock) {
      console.log('[TopicsAction] Detected uninitialized/mock topics. Running real-time discovery...')
      await refreshIntelligenceAction()
      const freshTopics = await prisma.topic.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return freshTopics.map(hydrateTopic)
    }

    const hydrated = rawTopics.map(hydrateTopic)
    hydrated.sort((a, b) => {
      const compA = (a.varsakaRelevance?.score || a.seoScore || 50) * 0.6 + (a.trendScore || 50) * 0.4
      const compB = (b.varsakaRelevance?.score || b.seoScore || 50) * 0.6 + (b.trendScore || 50) * 0.4
      return compB - compA
    })
    return hydrated
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

export async function getTopicById(id: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id }
    })
    if (!topic) return null
    return hydrateTopic(topic)
  } catch (error) {
    console.error('Error fetching topic by id:', error)
    return null
  }
}

export async function createTopic(name: string) {
  try {
    const cleanName = name.trim()
    const isCaseStudy = cleanName.toLowerCase().startsWith('case study:')
    
    // Check if canonical topic already exists to prevent duplicate insertion
    const existing = await prisma.topic.findFirst({
      where: {
        name: {
          equals: cleanName
        }
      }
    })

    if (existing) {
      return { success: true, topic: hydrateTopic(existing), alreadyExisted: true }
    }

    const { canonicalTopic } = { canonicalTopic: cleanName }
    const cluster = processAndClusterTrends([
      {
        title: cleanName,
        source: 'User Custom Discovery',
        sourceUrl: 'https://varsaka.com',
        publishedAt: new Date().toISOString(),
        discoveredAt: new Date().toISOString(),
        summary: `Custom prioritized topic input for Varsaka Content Intelligence: ${cleanName}`,
        engagementScore: 120
      }
    ])[0]

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
      lastDiscovered: cluster.lastDiscovered
    })

    const topic = await prisma.topic.create({
      data: {
        name: cleanName,
        trendScore: cluster.trendScore,
        seoScore: cluster.varsakaRelevance.score,
        competitionScore: 45,
        searchIntent: metadataJson,
        suggestedType: isCaseStudy ? 'CASE_STUDY' : 'TECHNICAL_BLOG',
        suggestedAudience: cluster.suggestedAngles[0]?.audience || 'Enterprise QA Leaders',
        status: 'DISCOVERED',
      }
    })

    revalidatePath('/dashboard/topics')
    return { success: true, topic: hydrateTopic(topic) }
  } catch (error) {
    console.error('Error creating topic:', error)
    return { success: false, error: 'Failed to create topic' }
  }
}

// Full Market Intelligence Discovery & Refresh Action
export async function refreshIntelligenceAction(): Promise<{
  success: boolean;
  topicsCount: number;
  sourcesCount: number;
  lastUpdated: string;
}> {
  try {
    console.log('[IntelligenceEngine] Initiating multi-source market intelligence harvest...')
    const { items, sourcesCount } = await harvestMarketTrends()
    console.log(`[IntelligenceEngine] Harvested ${items.length} raw trend dispatches across ${sourcesCount} sources.`)

    const clusters = processAndClusterTrends(items)
    console.log(`[IntelligenceEngine] Clustered into ${clusters.length} unique semantic topic clusters.`)

    // Load all existing topics to deduplicate against database
    const existingTopics = await prisma.topic.findMany()
    const existingNameMap = new Map<string, any>()
    const duplicatesToDelete: string[] = []

    for (const t of existingTopics) {
      const key = normalizeTopicKey(t.name)
      if (existingNameMap.has(key)) {
        // Mark duplicate topic for cleanup to guarantee no duplicate cards
        duplicatesToDelete.push(t.id)
      } else {
        existingNameMap.set(key, t)
      }
    }

    // Delete redundant duplicates from previous runs (e.g. repeated "AI in Healthcare")
    if (duplicatesToDelete.length > 0) {
      console.log(`[IntelligenceEngine] Cleaning up ${duplicatesToDelete.length} redundant duplicate topics...`)
      for (const id of duplicatesToDelete) {
        try {
          await prisma.topic.delete({ where: { id } })
        } catch {
          // Ignore if referenced
        }
      }
    }

    // Persist or update top discovered clusters
    const topClusters = clusters.slice(0, 15) // Keep top high-relevance clusters
    const nowIso = new Date().toISOString()

    for (const cluster of topClusters) {
      const key = normalizeTopicKey(cluster.canonicalTopic)
      const existing = existingNameMap.get(key)

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
      })

      if (existing) {
        // Update existing canonical record with latest scores and sources
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
        })
      } else {
        // Insert new canonical topic
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
        })
      }
    }

    try {
      revalidatePath('/dashboard/topics')
      revalidatePath('/dashboard')
    } catch {
      // Safe fallback when called from outside standard Server Action lifecycle
    }

    return {
      success: true,
      topicsCount: topClusters.length,
      sourcesCount,
      lastUpdated: nowIso
    }
  } catch (error) {
    console.error('[IntelligenceEngine] Failed to refresh intelligence:', error)
    return {
      success: false,
      topicsCount: 0,
      sourcesCount: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}
