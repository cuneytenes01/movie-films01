'use client'

import { useState, useEffect, useRef } from 'react'

interface MovieFiltersProps {
  genres: { id: number; name: string }[]
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  sortBy: string
  selectedGenres: number[]
  releaseDateFrom: string
  releaseDateTo: string
  minRating: number
  minVotes: number
  runtimeMin: number
  runtimeMax: number
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popülerlik (Azalan)' },
  { value: 'popularity.asc', label: 'Popülerlik (Artan)' },
  { value: 'vote_average.desc', label: 'Puan (Azalan)' },
  { value: 'vote_average.asc', label: 'Puan (Artan)' },
  { value: 'release_date.desc', label: 'Yayın Tarihi (Azalan)' },
  { value: 'release_date.asc', label: 'Yayın Tarihi (Artan)' },
  { value: 'title.asc', label: 'Başlık (A-Z)' },
  { value: 'title.desc', label: 'Başlık (Z-A)' },
]

// Icon Components
const SortIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
)

const GenreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31 2.37 2.37a1.724 1.724 0 002.572 1.065c.426 1.756 2.924 1.756 3.35 0a1.724 1.724 0 002.573-1.066c1.543.94 3.31-.826 2.37-2.37a1.724 1.724 0 001.065-2.572c1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c.94-1.543-.826-3.31-2.37-2.37a1.724 1.724 0 00-2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function MovieFilters({ genres, onFilterChange }: MovieFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'popularity.desc',
    selectedGenres: [],
    releaseDateFrom: '',
    releaseDateTo: '',
    minRating: 0,
    minVotes: 0,
    runtimeMin: 0,
    runtimeMax: 300,
  })
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    sort: false,
    genres: false,
    dates: false,
    ratings: false,
    other: false,
  })
  const filterRef = useRef<HTMLDivElement>(null)

  // Initialize filters on mount
  useEffect(() => {
    onFilterChange(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setExpandedSections({
          sort: false,
          genres: false,
          dates: false,
          ratings: false,
          other: false,
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.selectedGenres.includes(genreId)
      ? filters.selectedGenres.filter(id => id !== genreId)
      : [...filters.selectedGenres, genreId]
    
    const newFilters = { ...filters, selectedGenres: newGenres }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      sortBy: 'popularity.desc',
      selectedGenres: [],
      releaseDateFrom: '',
      releaseDateTo: '',
      minRating: 0,
      minVotes: 0,
      runtimeMin: 0,
      runtimeMax: 300,
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFiltersCount = 
    (filters.selectedGenres.length > 0 ? 1 : 0) +
    (filters.releaseDateFrom || filters.releaseDateTo ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minVotes > 0 ? 1 : 0) +
    (filters.runtimeMin > 0 || filters.runtimeMax < 300 ? 1 : 0)

  const getSelectedSortLabel = () => {
    const selected = SORT_OPTIONS.find(opt => opt.value === filters.sortBy)
    return selected ? selected.label : 'Sırala'
  }

  return (
    <div ref={filterRef} className="w-full bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 rounded-xl shadow-lg border-2 border-purple-400 mb-6 overflow-visible relative">
      {/* Header with Filters in one line */}
      <div className="bg-transparent px-3 md:px-6 py-2 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Filtreler başlığı - Sadece desktop'ta görünür */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <SettingsIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white drop-shadow-lg">Filtreler</h2>
            </div>
            {activeFiltersCount > 0 && (
              <span className="px-2.5 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/50">
                {activeFiltersCount} aktif
              </span>
            )}
          </div>

          {/* Aktif filtre sayısı - Sadece mobilde görünür */}
          {activeFiltersCount > 0 && (
            <div className="md:hidden flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/50">
                {activeFiltersCount} aktif
              </span>
            </div>
          )}

          {/* Filter Buttons - Yatay scroll mobilde */}
          <div className="flex gap-2 md:gap-3 flex-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Sort */}
          <div className="flex-shrink-0 relative z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('sort')
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('sort')
              }}
              className={`group flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm shadow-lg border-2 flex-shrink-0 h-[42px] md:h-auto whitespace-nowrap ${
                expandedSections.sort
                  ? 'bg-white text-purple-600 border-white shadow-xl scale-105'
                  : filters.sortBy !== 'popularity.desc'
                  ? 'bg-white/90 text-purple-700 border-white hover:bg-white'
                  : 'bg-white/80 text-gray-700 border-white/50 hover:bg-white hover:border-white'
              }`}
            >
              <SortIcon />
              <span className="hidden sm:inline">{getSelectedSortLabel()}</span>
              <span className="sm:hidden">Sırala</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${expandedSections.sort ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.sort && (
              <div className="absolute mt-2 left-0 z-[9999] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary-200 rounded-xl shadow-2xl p-4 min-w-[240px] max-w-[90vw] md:max-w-none animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleFilterChange('sortBy', option.value)
                        setExpandedSections(prev => ({ ...prev, sort: false }))
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleFilterChange('sortBy', option.value)
                        setExpandedSections(prev => ({ ...prev, sort: false }))
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        filters.sortBy === option.value
                          ? 'bg-primary-600 text-white font-medium shadow-md'
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="flex-shrink-0 relative z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('genres')
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('genres')
              }}
              className={`group flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm shadow-lg border-2 flex-shrink-0 h-[42px] md:h-auto whitespace-nowrap ${
                expandedSections.genres
                  ? 'bg-white text-purple-600 border-white shadow-xl scale-105'
                  : filters.selectedGenres.length > 0
                  ? 'bg-white text-purple-600 border-white hover:bg-white/90'
                  : 'bg-white/80 text-gray-700 border-white/50 hover:bg-white hover:border-white'
              }`}
            >
              <GenreIcon />
              <span className="hidden sm:inline">Türler</span>
              <span className="sm:hidden">Tür</span>
              {filters.selectedGenres.length > 0 && (
                <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {filters.selectedGenres.length}
                </span>
              )}
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${expandedSections.genres ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.genres && (
              <div className="absolute mt-2 left-0 z-[9999] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-2xl p-4 max-w-[90vw] md:max-w-md max-h-80 overflow-y-auto animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-2.5">
                  {genres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleGenreToggle(genre.id)
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleGenreToggle(genre.id)
                      }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[100px] text-center ${
                        filters.selectedGenres.includes(genre.id)
                          ? 'bg-purple-600 text-white shadow-lg scale-105 border-2 border-purple-700'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex-shrink-0 relative z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('dates')
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('dates')
              }}
              className={`group flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm shadow-lg border-2 flex-shrink-0 h-[42px] md:h-auto whitespace-nowrap ${
                expandedSections.dates
                  ? 'bg-white text-purple-600 border-white shadow-xl scale-105'
                  : filters.releaseDateFrom || filters.releaseDateTo
                  ? 'bg-white text-purple-600 border-white hover:bg-white/90'
                  : 'bg-white/80 text-gray-700 border-white/50 hover:bg-white hover:border-white'
              }`}
            >
              <CalendarIcon />
              <span className="hidden sm:inline">Tarihler</span>
              <span className="sm:hidden">Tarih</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${expandedSections.dates ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.dates && (
              <div className="absolute mt-2 left-0 z-[9999] bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-2xl p-5 min-w-[90vw] md:min-w-[340px] animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <CalendarIcon />
                      Yayın Tarihleri
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Başlangıç</label>
                        <input
                          type="date"
                          value={filters.releaseDateFrom}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleFilterChange('releaseDateFrom', e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Bitiş</label>
                        <input
                          type="date"
                          value={filters.releaseDateTo}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleFilterChange('releaseDateTo', e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ratings */}
          <div className="flex-shrink-0 relative z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('ratings')
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('ratings')
              }}
              className={`group flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm shadow-lg border-2 flex-shrink-0 h-[42px] md:h-auto whitespace-nowrap ${
                expandedSections.ratings
                  ? 'bg-white text-purple-600 border-white shadow-xl scale-105'
                  : filters.minRating > 0 || filters.minVotes > 0
                  ? 'bg-white text-purple-600 border-white hover:bg-white/90'
                  : 'bg-white/80 text-gray-700 border-white/50 hover:bg-white hover:border-white'
              }`}
            >
              <StarIcon />
              <span className="hidden sm:inline">Puan & Oy</span>
              <span className="sm:hidden">Puan</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${expandedSections.ratings ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.ratings && (
              <div className="absolute mt-2 left-0 z-[9999] bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-2xl p-5 min-w-[90vw] md:min-w-[280px] animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <StarIcon />
                        Minimum Puan
                      </label>
                      <span className="text-sm font-bold text-primary-600">
                        {filters.minRating > 0 ? filters.minRating.toFixed(1) : 'Tümü'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={filters.minRating}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleFilterChange('minRating', parseFloat(e.target.value))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(filters.minRating / 10) * 100}%, #e5e7eb ${(filters.minRating / 10) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-5">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Oy Sayısı</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minVotes}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleFilterChange('minVotes', parseInt(e.target.value) || 0)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Filters */}
          <div className="flex-shrink-0 relative z-[100]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('other')
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSection('other')
              }}
              className={`group flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm shadow-lg border-2 flex-shrink-0 h-[42px] md:h-auto whitespace-nowrap ${
                expandedSections.other
                  ? 'bg-white text-purple-600 border-white shadow-xl scale-105'
                  : filters.runtimeMin > 0 || filters.runtimeMax < 300
                  ? 'bg-white text-purple-600 border-white hover:bg-white/90'
                  : 'bg-white/80 text-gray-700 border-white/50 hover:bg-white hover:border-white'
              }`}
            >
              <SettingsIcon />
              <span>Diğer</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${expandedSections.other ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.other && (
              <div className="absolute mt-2 left-0 z-[9999] bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl shadow-2xl p-5 min-w-[90vw] md:min-w-[320px] animate-[fadeIn_0.2s_ease-in-out]" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Film Süresi (dakika)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Minimum</label>
                        <input
                          type="number"
                          min="0"
                          value={filters.runtimeMin}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleFilterChange('runtimeMin', parseInt(e.target.value) || 0)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Maksimum</label>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={filters.runtimeMax}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleFilterChange('runtimeMax', parseInt(e.target.value) || 300)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200 font-medium ml-auto md:ml-0 shadow-md border-2 border-white flex-shrink-0"
            >
              <CloseIcon />
              <span className="hidden sm:inline">Tümünü Temizle</span>
              <span className="sm:hidden">Temizle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
