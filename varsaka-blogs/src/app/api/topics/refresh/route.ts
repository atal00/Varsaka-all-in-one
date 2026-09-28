import { NextResponse } from 'next/server';
import { refreshIntelligenceAction } from '@/app/actions/topics';

// POST /api/topics/refresh
// Triggers live multi-source market intelligence harvest & deduplication
export async function POST(request: Request) {
  try {
    const result = await refreshIntelligenceAction();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/topics/refresh
// Allows simple webhook / cron execution
export async function GET(request: Request) {
  try {
    const result = await refreshIntelligenceAction();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
