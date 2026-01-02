import { NextRequest, NextResponse } from 'next/server'
import { getPersonDetails } from '@/lib/tmdb'

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const person = await getPersonDetails(parseInt(params.id))
    return NextResponse.json(person)
  } catch (error) {
    console.error('Person API hatası:', error)
    return NextResponse.json({ error: 'Kişi bulunamadı' }, { status: 404 })
  }
}

