'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPosterUrl, TVShow } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'
import TVFilters, { TVFilterState } from '@/components/TVFilters'

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

export default function TVPage() {
  const [tvShows, setTVShows] = useState<TVShow[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TVFilterState>({
    sortBy: 'popularity.desc',
    selectedGenres: [],
    firstAirDateFrom: '',
    firstAirDateTo: '',
    airDateFrom: '',
    airDateTo: '',
    minRating: 0,
    minVotes: 0,
    runtimeMin: 0,
    runtimeMax: 300,
    network: '',
    language: '',
  })

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

  useEffect(() => {
    async function loadTVShows() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', '1')
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
        setTVShows(data.results || [])
      } catch (error) {
        console.error('Diziler yüklenemedi:', error)
        setTVShows([])
      } finally {
        setLoading(false)
      }
    }
    loadTVShows()
  }, [filters])

  return (
    <div className="min-h-screen bg-gray-900 overflow-visible">
      <div className="container mx-auto px-4 py-8 overflow-visible">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white">TV Dizileri</h1>
        </div>

        {/* Filters at the top */}
        {genres.length > 0 && (
          <TVFilters genres={genres} onFilterChange={setFilters} variant="blue" />
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
