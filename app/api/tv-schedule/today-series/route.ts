import { NextRequest, NextResponse } from 'next/server';
import { getTodaySeries } from '@/lib/tv-schedule';

export async function GET(request: NextRequest) {
  try {
    const series = await getTodaySeries();
    
    return NextResponse.json({
      success: true,
      data: series,
      count: series.length
    });
  } catch (error) {
    console.error('Today series API error:', error);
    return NextResponse.json(
      { success: false, error: 'Diziler yüklenemedi' },
      { status: 500 }
    );
  }
}

