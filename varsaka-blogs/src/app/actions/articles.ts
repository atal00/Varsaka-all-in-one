'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return articles
  } catch (dbError) {
    console.error('Error fetching articles:', dbError)
    return []
  }
}

// Example: Securely creating an article
export async function createArticle(title: string, content: string, keywords: string = '') {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized access.')
  }

  try {
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        keywords: keywords || '',
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        // Link the article to the currently authenticated user
        author: {
          connect: { supabaseId: user.id }
        }
      }
    })
    
    revalidatePath('/dashboard/articles')
    return { success: true, article: newArticle }
  } catch (dbError) {
    console.error('Error creating article:', dbError)
    throw new Error('Failed to create article')
  }
}
