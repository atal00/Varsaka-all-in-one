import { NextResponse } from 'next/server';
import { performDeepResearch } from '@/lib/content-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId } = body;
    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const research = await performDeepResearch(topicId);
    return NextResponse.json(research);
  } catch (error) {
    console.error('[DeepResearch API Error]', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
