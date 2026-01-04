import { NextRequest, NextResponse } from 'next/server';
import { getTodayMovies } from '@/lib/tv-schedule';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const movies = await getTodayMovies();
    
    return NextResponse.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Today movies API error:', error);
    return NextResponse.json(
      { success: false, error: 'Filmler yüklenemedi' },
      { status: 500 }
    );
  }
}

