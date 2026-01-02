'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPersonDetails, getPersonCredits, getProfileUrl, getPosterUrl, PersonDetails, PersonCredits } from '@/lib/tmdb'

export const runtime = 'edge';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [person, setPerson] = useState<PersonDetails | null>(null)
  const [credits, setCredits] = useState<PersonCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [personData, creditsData] = await Promise.all([
          fetch(`/api/person/${id}`).then(res => res.json()),
          fetch(`/api/person/${id}/credits`).then(res => res.json())
        ]);
        setPerson(personData)
        setCredits(creditsData)
      } catch (err) {
        setError('Kişi bulunamadı')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Yükleniyor...</p>
      </div>
    )
  }

  if (error || !person || !credits) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">{error || 'Kişi bulunamadı'}</p>
      </div>
    )
  }

  const castMovies = credits.cast.filter((item) => item.media_type === 'movie') as any[];
  const castTV = credits.cast.filter((item) => item.media_type === 'tv') as any[];
  const knownFor = [...castMovies, ...castTV]
    .sort((a, b) => {
      const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
      const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="relative w-48 md:w-64 h-72 md:h-96 rounded-lg overflow-hidden bg-gray-800 shadow-2xl border-2 border-white/10">
              <Image
                src={getProfileUrl(person.profile_path, 'h632')}
                alt={person.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 256px"
                unoptimized={person.profile_path === null}
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 bg-gray-800/95 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {person.name}
            </h1>

            {/* Personal Info */}
            <div className="space-y-2 mb-6 text-gray-300">
              {person.birthday && (
                <div>
                  <span className="font-semibold text-white">Doğum Tarihi: </span>
                  {new Date(person.birthday).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {person.deathday && (
                    <span> - {new Date(person.deathday).toLocaleDateString('tr-TR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  )}
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <span className="font-semibold text-white">Doğum Yeri: </span>
                  {person.place_of_birth}
                </div>
              )}
              {person.known_for_department && (
                <div>
                  <span className="font-semibold text-white">Bilinen Alan: </span>
                  {person.known_for_department}
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3 text-white">Biyografi</h2>
                <p className="text-gray-100 leading-relaxed text-base md:text-lg whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Known For */}
        {knownFor.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Bilinen Yapımlar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {knownFor.map((item) => {
                const title = 'title' in item ? item.title : item.name;
                const date = 'release_date' in item ? item.release_date : item.first_air_date;
                const url = item.media_type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
                const character = item.character || item.job;

                return (
                  <Link key={`${item.media_type}-${item.id}`} href={url} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                      <Image
                        src={getPosterUrl(item.poster_path)}
                        alt={title}
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
          </div>
        )}
      </div>
    </div>
  )
}

