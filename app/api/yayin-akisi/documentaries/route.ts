import { NextResponse } from 'next/server';
import { getTodayDocumentaries } from '@/lib/tvplus';

export const runtime = 'edge';

export async function GET() {
  try {
    const documentaries = await getTodayDocumentaries();
    
    return NextResponse.json({
      success: true,
      data: documentaries,
      count: documentaries.length,
    });
  } catch (error) {
    console.error('[API] Error fetching documentaries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documentaries', data: [], count: 0 },
      { status: 500 }
    );
  }
}

