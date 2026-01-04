'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { getPosterUrl, Movie } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'
import MovieFilters, { FilterState } from '@/components/MovieFilters'
import { debounce } from '@/lib/utils'

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/${createSlug(movie.title, 'movie')}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
        <Image
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          unoptimized={movie.poster_path === null}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-semibold line-clamp-2">{movie.title}</p>
            {movie.vote_average !== undefined && movie.vote_average !== null && (
              <p className="text-xs text-gray-300 mt-1">⭐ {movie.vote_average.toFixed(1)}</p>
            )}
            {movie.release_date && (
              <p className="text-xs text-gray-400 mt-1">{new Date(movie.release_date).getFullYear()}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-1">
        <p className="text-white font-semibold text-sm line-clamp-1 group-hover:text-primary-400 transition">
          {movie.title}
        </p>
        {movie.release_date && (
          <p className="text-gray-400 text-xs mt-1">{new Date(movie.release_date).getFullYear()}</p>
        )}
      </div>
    </Link>
  )
}

// URL'den filtreleri parse et
function parseFiltersFromURL(searchParams: URLSearchParams): FilterState {
  return {
    sortBy: searchParams.get('sort_by') || 'popularity.desc',
    selectedGenres: searchParams.get('genres')?.split(',').filter(Boolean).map(Number) || [],
    releaseDateFrom: searchParams.get('release_date_from') || '',
    releaseDateTo: searchParams.get('release_date_to') || '',
    minRating: parseFloat(searchParams.get('min_rating') || '0'),
    minVotes: parseInt(searchParams.get('min_votes') || '0'),
    runtimeMin: parseInt(searchParams.get('runtime_min') || '0'),
    runtimeMax: parseInt(searchParams.get('runtime_max') || '300'),
  }
}

// Filtreleri URL'e yaz
function updateURLFromFilters(filters: FilterState, router: ReturnType<typeof useRouter>) {
  const params = new URLSearchParams()
  
  if (filters.sortBy !== 'popularity.desc') params.set('sort_by', filters.sortBy)
  if (filters.selectedGenres.length > 0) params.set('genres', filters.selectedGenres.join(','))
  if (filters.releaseDateFrom) params.set('release_date_from', filters.releaseDateFrom)
  if (filters.releaseDateTo) params.set('release_date_to', filters.releaseDateTo)
  if (filters.minRating > 0) params.set('min_rating', filters.minRating.toString())
  if (filters.minVotes > 0) params.set('min_votes', filters.minVotes.toString())
  if (filters.runtimeMin > 0) params.set('runtime_min', filters.runtimeMin.toString())
  if (filters.runtimeMax < 300) params.set('runtime_max', filters.runtimeMax.toString())
  
  const queryString = params.toString()
  router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false })
}

export default function MoviesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromURL(searchParams))

  const hasMore = page < totalPages

  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch('/api/genres/movie')
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

  // Movies yükleme fonksiyonu
  const loadMovies = useCallback(async (pageNum: number, append: boolean = false) => {
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
      if (filters.releaseDateFrom) {
        params.append('primary_release_date.gte', filters.releaseDateFrom)
      }
      if (filters.releaseDateTo) {
        params.append('primary_release_date.lte', filters.releaseDateTo)
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

      const response = await fetch(`/api/discover/movie?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (append) {
        setMovies(prev => [...prev, ...(data.results || [])])
      } else {
        setMovies(data.results || [])
      }
      
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error('Filmler yüklenemedi:', error)
      if (!append) {
        setMovies([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  // Filtreler değiştiğinde sayfa 1'e dön ve yükle
  useEffect(() => {
    setPage(1)
    loadMovies(1, false)
  }, [filters, loadMovies])

  // Sayfa değiştiğinde yükle (infinity scroll)
  useEffect(() => {
    if (page > 1) {
      loadMovies(page, true)
    }
  }, [page, loadMovies])

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
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    updateURLFromFilters(newFilters, router)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 overflow-visible">
      <div className="container mx-auto px-4 py-8 overflow-visible">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white">Filmler</h1>
        </div>

        {/* Filters at the top */}
        <MovieFilters 
          genres={genres} 
          filters={filters}
          onFilterChange={handleFilterChange} 
        />

        {/* Movies Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          ) : movies.length > 0 ? (
            <>
              <p className="text-gray-400 mb-4">{movies.length} film bulundu</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              {loadingMore && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Daha fazla yükleniyor...</p>
                </div>
              )}
              {!hasMore && movies.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Tüm sonuçlar gösterildi.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">Film bulunamadı.</p>
              <p className="text-gray-500 text-sm mt-2">Filtreleri değiştirip tekrar deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
