import { NextResponse } from 'next/server';
import { getTodaySports } from '@/lib/tvplus';

export const runtime = 'edge';

export async function GET() {
  try {
    const sports = await getTodaySports();
    
    return NextResponse.json({
      success: true,
      data: sports,
      count: sports.length,
    });
  } catch (error) {
    console.error('[API] Error fetching sports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sports', data: [], count: 0 },
      { status: 500 }
    );
  }
}

