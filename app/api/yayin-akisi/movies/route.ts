import { NextResponse } from 'next/server';
import { getTodayMovies } from '@/lib/tvplus';

export const runtime = 'edge';

export async function GET() {
  try {
    const movies = await getTodayMovies();
    
    return NextResponse.json({
      success: true,
      data: movies,
      count: movies.length,
    });
  } catch (error) {
    console.error('[API] Error fetching movies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch movies', data: [], count: 0 },
      { status: 500 }
    );
  }
}

