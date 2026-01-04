'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { getPosterUrl, TVShow } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'
import TVFilters, { TVFilterState } from '@/components/TVFilters'
import { debounce } from '@/lib/utils'

function TVCard({ tvShow }: { tvShow: TVShow }) {
  return (
    <Link href={`/${createSlug(tvShow.name, 'tv')}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
        <Image
          src={getPosterUrl(tvShow.poster_path)}
          alt={tvShow.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          unoptimized={tvShow.poster_path === null}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-semibold line-clamp-2 text-white">{tvShow.name}</p>
            {tvShow.vote_average !== undefined && tvShow.vote_average !== null && (
              <p className="text-xs text-gray-300 mt-1">⭐ {tvShow.vote_average.toFixed(1)}</p>
            )}
            {tvShow.first_air_date && (
              <p className="text-xs text-gray-400 mt-1">{new Date(tvShow.first_air_date).getFullYear()}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-1">
        <p className="text-white font-semibold text-sm line-clamp-1 group-hover:text-primary-400 transition">
          {tvShow.name}
        </p>
        {tvShow.first_air_date && (
          <p className="text-gray-400 text-xs mt-1">{new Date(tvShow.first_air_date).getFullYear()}</p>
        )}
      </div>
    </Link>
  )
}

// URL'den filtreleri parse et
function parseFiltersFromURL(searchParams: URLSearchParams): TVFilterState {
  return {
    sortBy: searchParams.get('sort_by') || 'popularity.desc',
    selectedGenres: searchParams.get('genres')?.split(',').filter(Boolean).map(Number) || [],
    firstAirDateFrom: searchParams.get('first_air_date_from') || '',
    firstAirDateTo: searchParams.get('first_air_date_to') || '',
    airDateFrom: searchParams.get('air_date_from') || '',
    airDateTo: searchParams.get('air_date_to') || '',
    minRating: parseFloat(searchParams.get('min_rating') || '0'),
    minVotes: parseInt(searchParams.get('min_votes') || '0'),
    runtimeMin: parseInt(searchParams.get('runtime_min') || '0'),
    runtimeMax: parseInt(searchParams.get('runtime_max') || '300'),
    network: searchParams.get('network') || '',
    language: searchParams.get('language') || '',
  }
}

// Filtreleri URL'e yaz
function updateURLFromFilters(filters: TVFilterState, router: ReturnType<typeof useRouter>, pathname: string) {
  const params = new URLSearchParams()
  
  if (filters.sortBy !== 'popularity.desc') params.set('sort_by', filters.sortBy)
  if (filters.selectedGenres.length > 0) params.set('genres', filters.selectedGenres.join(','))
  if (filters.firstAirDateFrom) params.set('first_air_date_from', filters.firstAirDateFrom)
  if (filters.firstAirDateTo) params.set('first_air_date_to', filters.firstAirDateTo)
  if (filters.airDateFrom) params.set('air_date_from', filters.airDateFrom)
  if (filters.airDateTo) params.set('air_date_to', filters.airDateTo)
  if (filters.minRating > 0) params.set('min_rating', filters.minRating.toString())
  if (filters.minVotes > 0) params.set('min_votes', filters.minVotes.toString())
  if (filters.runtimeMin > 0) params.set('runtime_min', filters.runtimeMin.toString())
  if (filters.runtimeMax < 300) params.set('runtime_max', filters.runtimeMax.toString())
  if (filters.network) params.set('network', filters.network)
  if (filters.language) params.set('language', filters.language)
  
  const queryString = params.toString()
  router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
}

function TVPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [tvShows, setTVShows] = useState<TVShow[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<TVFilterState>(() => parseFiltersFromURL(searchParams))

  const hasMore = page < totalPages

  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch('/api/genres/tv')
        const data = await response.json()
        setGenres(data.genres || [])
      } catch (error) {
        console.error('Türler yüklenemedi:', error)
      }
    }
    loadGenres()
  }, [])

  // URL değiştiğinde filtreleri güncelle
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams)
    setFilters(urlFilters)
  }, [searchParams])

  // TV Shows yükleme fonksiyonu
  const loadTVShows = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const params = new URLSearchParams()
      params.append('page', pageNum.toString())
      params.append('sort_by', filters.sortBy)
      if (filters.selectedGenres.length > 0) {
        params.append('with_genres', filters.selectedGenres.join(','))
      }
      if (filters.firstAirDateFrom) {
        params.append('first_air_date.gte', filters.firstAirDateFrom)
      }
      if (filters.firstAirDateTo) {
        params.append('first_air_date.lte', filters.firstAirDateTo)
      }
      if (filters.airDateFrom) {
        params.append('air_date.gte', filters.airDateFrom)
      }
      if (filters.airDateTo) {
        params.append('air_date.lte', filters.airDateTo)
      }
      if (filters.minRating > 0) {
        params.append('vote_average.gte', filters.minRating.toString())
      }
      if (filters.minVotes > 0) {
        params.append('vote_count.gte', filters.minVotes.toString())
      }
      if (filters.runtimeMin > 0) {
        params.append('with_runtime.gte', filters.runtimeMin.toString())
      }
      if (filters.runtimeMax < 300) {
        params.append('with_runtime.lte', filters.runtimeMax.toString())
      }
      if (filters.language) {
        params.append('with_original_language', filters.language)
      }

      const response = await fetch(`/api/discover/tv?${params.toString()}`)
      const data = await response.json()
      
      if (append) {
        setTVShows(prev => [...prev, ...(data.results || [])])
      } else {
        setTVShows(data.results || [])
      }
      
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error('Diziler yüklenemedi:', error)
      if (!append) {
        setTVShows([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  // Filtreler değiştiğinde sayfa 1'e dön ve yükle
  useEffect(() => {
    setPage(1)
    loadTVShows(1, false)
  }, [filters, loadTVShows])

  // Sayfa değiştiğinde yükle (infinity scroll)
  useEffect(() => {
    if (page > 1) {
      loadTVShows(page, true)
    }
  }, [page, loadTVShows])

  // Infinity scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Sayfa sonuna 200px kala yükle
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setPage(prev => prev + 1)
      }
    }
    
    const debouncedHandleScroll = debounce(handleScroll, 100)
    window.addEventListener('scroll', debouncedHandleScroll)
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
    }
  }, [hasMore, loadingMore])

  // Filtre değişikliği handler
  const handleFilterChange = useCallback((newFilters: TVFilterState) => {
    setFilters(newFilters)
    updateURLFromFilters(newFilters, router, pathname)
  }, [router, pathname])

  return (
    <div className="min-h-screen bg-gray-900 overflow-visible">
      <div className="container mx-auto px-4 py-8 overflow-visible">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white">TV Dizileri</h1>
        </div>

        {/* Filters at the top */}
        {genres.length > 0 && (
          <TVFilters 
            genres={genres} 
            filters={filters}
            onFilterChange={handleFilterChange} 
            variant="blue" 
          />
        )}

        {/* TV Shows Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          ) : tvShows.length > 0 ? (
            <>
              <p className="text-gray-400 mb-4">{tvShows.length} dizi bulundu</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tvShows.map((tvShow) => (
                  <TVCard key={tvShow.id} tvShow={tvShow} />
                ))}
              </div>
              {loadingMore && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Daha fazla yükleniyor...</p>
                </div>
              )}
              {!hasMore && tvShows.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Tüm sonuçlar gösterildi.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">Dizi bulunamadı.</p>
              <p className="text-gray-500 text-sm mt-2">Filtreleri değiştirip tekrar deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TVPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    }>
      <TVPageContent />
    </Suspense>
  )
}
