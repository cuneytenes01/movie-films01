import { NextRequest, NextResponse } from 'next/server'
import { discoverMovies } from '@/lib/tmdb'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const params: any = {
      page: parseInt(searchParams.get('page') || '1'),
    }

    if (searchParams.get('sort_by')) {
      params.sort_by = searchParams.get('sort_by')
    }
    if (searchParams.get('with_genres')) {
      params.with_genres = searchParams.get('with_genres')
    }
    if (searchParams.get('primary_release_date.gte')) {
      params['primary_release_date.gte'] = searchParams.get('primary_release_date.gte')
    }
    if (searchParams.get('primary_release_date.lte')) {
      params['primary_release_date.lte'] = searchParams.get('primary_release_date.lte')
    }
    if (searchParams.get('vote_average.gte')) {
      params['vote_average.gte'] = parseFloat(searchParams.get('vote_average.gte') || '0')
    }
    if (searchParams.get('vote_count.gte')) {
      params['vote_count.gte'] = parseInt(searchParams.get('vote_count.gte') || '0')
    }
    if (searchParams.get('with_runtime.gte')) {
      params.with_runtime_gte = parseInt(searchParams.get('with_runtime.gte') || '0')
    }
    if (searchParams.get('with_runtime.lte')) {
      params.with_runtime_lte = parseInt(searchParams.get('with_runtime.lte') || '300')
    }

    const result = await discoverMovies(params)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Discover movies API hatası:', error)
    return NextResponse.json({ error: 'Filmler yüklenemedi' }, { status: 500 })
  }
}



