import { NextRequest, NextResponse } from 'next/server';
import { getTodayMatches } from '@/lib/tv-schedule';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = (searchParams.get('sport') || 'futbol') as 'futbol' | 'basketbol';
    
    const matches = await getTodayMatches(sport);
    
    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Today matches API error:', error);
    return NextResponse.json(
      { success: false, error: 'Maçlar yüklenemedi' },
      { status: 500 }
    );
  }
}

