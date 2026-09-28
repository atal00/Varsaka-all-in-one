'use server'

import prisma from '@/lib/prisma'

export async function getStats() {
  try {
    const topicsDiscovered = await prisma.topic.count()
    const articlesGenerated = await prisma.article.count()
    const deepResearchScans = await prisma.research.count()
    
    const caseStudiesGenerated = await prisma.caseStudy.count()

    return {
      topicsDiscovered,
      topicsTrend: '+15 live clusters',
      articlesGenerated,
      articlesTrend: `${articlesGenerated} drafts & published`,
      caseStudiesGenerated,
      caseStudiesTrend: `${caseStudiesGenerated} benchmarks`,
      deepResearchScans,
      activeCrawlers: 6,
      dataSources: '6 Verified Feeds'
    }
  } catch (error) {
    console.error('Failed to get stats', error)
    return {
      topicsDiscovered: 0,
      topicsTrend: 'No data',
      articlesGenerated: 0,
      articlesTrend: 'No data',
      caseStudiesGenerated: 0,
      caseStudiesTrend: 'No data',
      deepResearchScans: 0,
      activeCrawlers: 0,
      dataSources: '0'
    }
  }
}
