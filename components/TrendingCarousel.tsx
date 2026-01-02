'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPosterUrl, Movie, TVShow } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'

interface TrendingCarouselProps {
  trendingToday: (Movie | TVShow)[]
  trendingWeek: (Movie | TVShow)[]
}

export default function TrendingCarousel({ trendingToday, trendingWeek }: TrendingCarouselProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Sort by release date - newest first
  const getItemDateValue = (item: Movie | TVShow): number => {
    const date = 'release_date' in item ? item.release_date : item.first_air_date
    if (!date) return 0
    return new Date(date).getTime()
  }
  
  const sortedToday = [...trendingToday].sort((a, b) => {
    const dateA = getItemDateValue(a)
    const dateB = getItemDateValue(b)
    return dateB - dateA // En yeni en başta
  })
  
  const sortedWeek = [...trendingWeek].sort((a, b) => {
    const dateA = getItemDateValue(a)
    const dateB = getItemDateValue(b)
    return dateB - dateA // En yeni en başta
  })
  
  const items = activeTab === 'day' ? sortedToday : sortedWeek

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400 // Scroll miktarı
      const currentScroll = scrollContainerRef.current.scrollLeft
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
  }

  const getItemTitle = (item: Movie | TVShow) => {
    return 'title' in item ? item.title : item.name
  }

  const getItemDate = (item: Movie | TVShow) => {
    const date = 'release_date' in item ? item.release_date : item.first_air_date
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getItemUrl = (item: Movie | TVShow) => {
    return 'title' in item ? `/${createSlug(item.title, 'movie')}` : `/${createSlug(item.name, 'tv')}`
  }

  const getRating = (item: Movie | TVShow) => {
    return Math.round(item.vote_average * 10)
  }

  return (
    <section className="mb-12 w-full">
      <div className="w-full px-6 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Trendler</h2>
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'day'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bugün
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bu Hafta
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full px-6 md:px-8">
        {/* Sol Ok Butonu - Sadece desktop'ta görünür */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            scroll('left');
          }}
          className="hidden md:flex absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group items-center justify-center"
          aria-label="Sol"
        >
          <svg className="w-6 h-6 text-white group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Sağ Ok Butonu - Sadece desktop'ta görünür */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            scroll('right');
          }}
          className="hidden md:flex absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group items-center justify-center"
          aria-label="Sağ"
        >
          <svg className="w-6 h-6 text-white group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {items.map((item) => (
              <Link
                key={item.id}
                href={getItemUrl(item)}
                className="group flex-shrink-0 w-48 md:w-56"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-1 shadow-lg">
                  <Image
                    src={getPosterUrl(item.poster_path)}
                    alt={getItemTitle(item)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 192px, 224px"
                    unoptimized={item.poster_path === null}
                  />
                  {/* Rating Badge */}
                  <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white font-bold text-sm">{getRating(item)}%</span>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm line-clamp-2 mb-1">
                        {getItemTitle(item)}
                      </p>
                      <p className="text-gray-200 text-sm font-medium">{getItemDate(item)}</p>
                    </div>
                  </div>
                </div>
                {/* Title Below Poster */}
                <div className="px-1">
                  <p className="text-white font-semibold text-lg md:text-base line-clamp-1 group-hover:text-primary-400 transition">
                    {getItemTitle(item)}
                  </p>
                  <p className="text-gray-200 dark:text-gray-300 text-base md:text-sm font-medium mt-1.5">{getItemDate(item)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

