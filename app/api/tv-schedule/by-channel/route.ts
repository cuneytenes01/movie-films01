import { NextResponse } from 'next/server';
import { getTodayTVScheduleByChannel } from '@/lib/tv-schedule';

export const runtime = 'edge';

export async function GET() {
  try {
    const scheduleByChannel = await getTodayTVScheduleByChannel();
    return NextResponse.json({ 
      success: true, 
      data: scheduleByChannel,
      count: scheduleByChannel.length 
    });
  } catch (error) {
    console.error('API Route Hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'TV yayın akışı yüklenemedi',
      data: []
    }, { status: 500 });
  }
}

