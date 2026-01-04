import { NextResponse } from 'next/server';
import { getTodaySeries } from '@/lib/tvplus';

export async function GET() {
  try {
    const series = await getTodaySeries();
    
    return NextResponse.json({
      success: true,
      data: series,
      count: series.length,
    });
  } catch (error) {
    console.error('[API] Error fetching series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch series', data: [], count: 0 },
      { status: 500 }
    );
  }
}

