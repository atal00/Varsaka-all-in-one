import { NextResponse } from 'next/server';
import { generateBlogArticle } from '@/lib/content-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId } = body;
    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const article = await generateBlogArticle(topicId);
    return NextResponse.json(article);
  } catch (error) {
    console.error('[GenerateArticle API Error]', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
