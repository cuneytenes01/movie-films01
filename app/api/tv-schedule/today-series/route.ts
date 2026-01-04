import { NextRequest, NextResponse } from 'next/server';
import { getTodaySeries } from '@/lib/tv-schedule';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching today series...');
    const series = await getTodaySeries();
    console.log(`[API] Fetched ${series.length} series`);
    
    return NextResponse.json({
      success: true,
      data: series,
      count: series.length
    });
  } catch (error) {
    console.error('[API] Today series API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Diziler yüklenemedi',
        message: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
        data: []
      },
      { status: 500 }
    );
  }
}

