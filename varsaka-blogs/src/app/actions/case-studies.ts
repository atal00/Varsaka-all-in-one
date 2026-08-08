'use server'

import prisma from '@/lib/prisma'

export async function getCaseStudies() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return caseStudies
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return []
  }
}
