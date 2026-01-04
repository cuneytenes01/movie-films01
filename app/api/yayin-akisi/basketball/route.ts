import { NextResponse } from 'next/server';
import { getTodayBasketballMatches } from '@/lib/tvplus';

export const runtime = 'edge';

export async function GET() {
  try {
    const basketball = await getTodayBasketballMatches();
    
    return NextResponse.json({
      success: true,
      data: basketball,
      count: basketball.length,
    });
  } catch (error) {
    console.error('[API] Error fetching basketball:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch basketball', data: [], count: 0 },
      { status: 500 }
    );
  }
}

