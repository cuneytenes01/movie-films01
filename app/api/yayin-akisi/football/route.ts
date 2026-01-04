import { NextResponse } from 'next/server';
import { getTodayFootballMatches } from '@/lib/tvplus';

export async function GET() {
  try {
    const football = await getTodayFootballMatches();
    
    return NextResponse.json({
      success: true,
      data: football,
      count: football.length,
    });
  } catch (error) {
    console.error('[API] Error fetching football:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch football', data: [], count: 0 },
      { status: 500 }
    );
  }
}

