'use server'

import prisma from '@/lib/prisma'

export async function getResearch() {
  try {
    const research = await prisma.research.findMany({
      include: { topic: true },
      orderBy: { createdAt: 'desc' }
    })
    return research
  } catch (error) {
    console.error('Error fetching research:', error)
    return []
  }
}

export async function createResearchScan(topicName: string) {
  try {
    const topic = await prisma.topic.create({
      data: {
        name: topicName,
        trendScore: Math.floor(Math.random() * 40) + 60,
        status: 'RESEARCHING',
      }
    })

    const research = await prisma.research.create({
      data: {
        topicId: topic.id,
        status: 'PENDING',
        sources: '[]',
        facts: '{}'
      }
    })
    return { success: true, research }
  } catch (error) {
    console.error('Error creating research:', error)
    return { success: false, error: 'Failed to create research' }
  }
}

export async function deleteResearch(id: string) {
  try {
    await prisma.research.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting research:', error)
    return { success: false }
  }
}
