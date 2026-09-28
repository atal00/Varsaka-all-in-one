import { NextResponse } from 'next/server';
import { generateCaseStudyArticle } from '@/lib/content-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId } = body;
    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const caseStudy = await generateCaseStudyArticle(topicId);
    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('[GenerateCaseStudy API Error]', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
