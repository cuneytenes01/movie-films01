import { NextRequest, NextResponse } from 'next/server';
import { getTodayMovies } from '@/lib/tv-schedule';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching today movies...');
    const movies = await getTodayMovies();
    console.log(`[API] Fetched ${movies.length} movies`);
    
    return NextResponse.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('[API] Today movies API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Filmler yüklenemedi',
        message: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
        data: []
      },
      { status: 500 }
    );
  }
}

