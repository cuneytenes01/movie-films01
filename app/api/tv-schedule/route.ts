import { NextResponse } from 'next/server';
import { getTodayTVSchedule } from '@/lib/tv-schedule';

export const runtime = 'edge';

export async function GET() {
  try {
    const schedule = await getTodayTVSchedule();
    return NextResponse.json({ 
      success: true, 
      count: schedule.length,
      items: schedule 
    });
  } catch (error) {
    console.error('TV Schedule API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      items: [] 
    }, { status: 500 });
  }
}


