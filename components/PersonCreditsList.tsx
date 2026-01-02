'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPosterUrl } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'

import { PersonMovieCredit, PersonTVCredit } from '@/lib/tmdb'

type PersonCredit = PersonMovieCredit | PersonTVCredit;

interface PersonCreditsListProps {
  credits: PersonCredit[];
}

export default function PersonCreditsList({ credits }: PersonCreditsListProps) {
  const [displayedCount, setDisplayedCount] = useState(12)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 1000) {
        if (displayedCount < credits.length && !loading) {
          setLoading(true)
          // Smooth loading animation
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + 12, credits.length))
            setLoading(false)
          }, 300)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [displayedCount, credits.length, loading])

  const displayedCredits = credits.slice(0, displayedCount)

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6 text-white">Bilinen Yapımlar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedCredits.map((item, index) => {
          const title = 'title' in item ? item.title : item.name;
          const date = 'release_date' in item ? item.release_date : item.first_air_date;
          const url = item.media_type === 'movie' 
            ? `/${createSlug('title' in item ? item.title : '', 'movie')}` 
            : `/${createSlug('name' in item ? item.name : '', 'tv')}`;
          const character = item.character || item.job;

          return (
            <Link key={`${item.media_type}-${item.id}-${index}`} href={url} className="group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                <Image
                  src={getPosterUrl(item.poster_path)}
                  alt={title || 'Poster'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  unoptimized={item.poster_path === null}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-semibold line-clamp-2 text-white">{title}</p>
                    {character && (
                      <p className="text-xs text-gray-300 mt-1 line-clamp-1">{character}</p>
                    )}
                    {date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(date).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-1">
                <p className="text-white font-semibold text-sm line-clamp-1 group-hover:text-primary-400 transition">
                  {title}
                </p>
                {character && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{character}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-2">Yükleniyor...</p>
        </div>
      )}
      
      {displayedCount >= credits.length && credits.length > 12 && (
        <div className="mt-8 text-center">
          <p className="text-gray-400">Tüm yapımlar gösterildi ({credits.length} yapım)</p>
        </div>
      )}
    </div>
  )
}

