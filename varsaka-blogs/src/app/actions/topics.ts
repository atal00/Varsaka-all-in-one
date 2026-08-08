'use server'

import prisma from '@/lib/prisma'

export async function getTopics() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return topics
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

export async function createTopic(name: string) {
  try {
    const topic = await prisma.topic.create({
      data: {
        name,
        trendScore: Math.floor(Math.random() * 40) + 60, // random score 60-100
        status: 'DISCOVERED',
      }
    })
    return { success: true, topic }
  } catch (error) {
    console.error('Error creating topic:', error)
    return { success: false, error: 'Failed to create topic' }
  }
}

export async function getTopicById(id: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id }
    })
    return topic
  } catch (error) {
    console.error('Error fetching topic by id:', error)
    return null
  }
}
