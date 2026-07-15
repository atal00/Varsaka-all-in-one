'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Example: Securely fetching articles
export async function getArticles() {
  const supabase = await createClient()
  
  // 1. Verify User Authentication (Safe from hacking)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized access. Please log in.')
  }

  // 2. Fetch data from Prisma Database
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      // Example of Row Level Security in code: Only fetch articles by this user
      // where: { author: { supabaseId: user.id } },
    })
    
    return articles
  } catch (dbError) {
    console.error('Error fetching articles:', dbError)
    throw new Error('Failed to fetch articles')
  }
}

// Example: Securely creating an article
export async function createArticle(title: string, content: string) {
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
