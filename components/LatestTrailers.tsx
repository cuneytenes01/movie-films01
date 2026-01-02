'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'

interface TrailerItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  trailer_key: string | null;
  trailer_name: string | null;
}

type FilterType = 'popular' | 'streaming' | 'on-tv' | 'in-theaters';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'popular', label: 'Popüler' },
  { value: 'streaming', label: 'Yayında' },
  { value: 'in-theaters', label: 'Sinemada' },
  { value: 'on-tv', label: 'TV\'de' },
];

export default function LatestTrailers() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('popular');
  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrailers(activeFilter);
  }, [activeFilter]);

  const fetchTrailers = async (filter: FilterType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trailers?filter=${filter}`);
      const data = await response.json();
      // Sadece trailer'ı olan içerikleri göster (TMDB gibi)
      const trailersWithVideo = (data.results || []).filter((item: TrailerItem) => item.trailer_key !== null);
      setTrailers(trailersWithVideo);
    } catch (error) {
      console.error('Trailer yükleme hatası:', error);
      setTrailers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrailer = (trailer: TrailerItem) => {
    if (trailer.trailer_key) {
      setSelectedTrailer(trailer);
    }
  };

  const closeTrailer = () => {
    setSelectedTrailer(null);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (loading && trailers.length === 0) {
    return (
      <section className="mb-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  if (trailers.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-12 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 py-12 w-full">
        <div className="w-full px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Son Fragmanlar</h2>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.value
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-white hover:bg-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full px-6 md:px-8">
            {/* Sol Ok Butonu - İçerik görselinde ortalanmış */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group"
              aria-label="Sol"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Sağ Ok Butonu - İçerik görselinde ortalanmış */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group"
              aria-label="Sağ"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
            >
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {trailers.map((trailer) => {
                  const date = trailer.release_date || trailer.first_air_date;
                  const url = trailer.media_type === 'movie'
                    ? `/${createSlug(trailer.title, 'movie')}`
                    : `/${createSlug(trailer.title, 'tv')}`;

                  // Dikey görsel varsa (backdrop_path) onu kullan, yoksa poster_path kullan
                  const imageUrl = trailer.backdrop_path 
                    ? getBackdropUrl(trailer.backdrop_path)
                    : getPosterUrl(trailer.poster_path, 'w500');
                  const aspectRatio = trailer.backdrop_path ? 'aspect-video' : 'aspect-[2/3]';

                  return (
                    <div
                      key={`${trailer.media_type}-${trailer.id}`}
                      className="flex-shrink-0 w-64 md:w-80 group"
                    >
                      <div className={`relative ${aspectRatio} rounded-lg overflow-hidden bg-gray-800 mb-3`}>
                        <Image
                          src={imageUrl}
                          alt={trailer.title}
                          fill
                          className="object-cover pointer-events-none"
                          sizes="(max-width: 768px) 256px, 320px"
                          unoptimized={trailer.poster_path === null && trailer.backdrop_path === null}
                        />
                        
                        {/* Play Button Overlay - Tüm karta tıklanabilir */}
                        {trailer.trailer_key ? (
                          <button
                            onClick={() => handlePlayTrailer(trailer)}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group/play cursor-pointer z-10"
                          >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                              <svg
                                className="w-8 h-8 md:w-10 md:h-10 text-gray-900 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </button>
                        ) : (
                          <Link href={url} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group/play">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                              <svg
                                className="w-8 h-8 md:w-10 md:h-10 text-gray-900 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </Link>
                        )}

                        {/* More Options Button */}
                        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      </div>

                      <Link href={url} className="block">
                        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1 group-hover:text-teal-400 transition drop-shadow-lg">
                          {trailer.title}
                        </h3>
                        <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                          {trailer.overview || trailer.trailer_name || ''}
                        </p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {selectedTrailer && selectedTrailer.trailer_key && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeTrailer();
            }
          }}
        >
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] aspect-video bg-black overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTrailer();
              }}
              className="absolute top-4 right-4 z-50 w-12 h-12 bg-black/80 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors shadow-2xl border-2 border-white/20"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedTrailer.trailer_key}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
