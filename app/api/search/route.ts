import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/tmdb'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter gerekli' }, { status: 400 })
  }

  try {
    const results = await searchContent(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Arama hatası:', error)
    return NextResponse.json({ error: 'Arama başarısız' }, { status: 500 })
  }
}



