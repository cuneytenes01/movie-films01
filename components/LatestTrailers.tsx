'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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

export default function LatestTrailers() {
  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchTrailers();
  }, []);

  const fetchTrailers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trailers?filter=popular`);
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
      <section className="mb-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 py-4 w-full">
        <div className="w-full px-6 md:px-8">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Son Fragmanlar</h2>
          </div>
        </div>

        <div className="relative w-full px-4 md:px-8">
            {/* Sol Ok Butonu - Sadece desktop'ta görünür */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                scroll('left');
              }}
              className="hidden md:flex absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group items-center justify-center"
              aria-label="Sol"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="hidden md:flex absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all hover:scale-110 group items-center justify-center"
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
              <div className="flex gap-3 md:gap-4" style={{ width: 'max-content' }}>
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
                      className="flex-shrink-0 w-[75vw] md:w-80 group"
                    >
                      {trailer.trailer_key ? (
                        <button
                          onClick={() => handlePlayTrailer(trailer)}
                          className="w-full"
                        >
                          <div className={`relative ${aspectRatio} rounded-lg overflow-hidden bg-gray-800 mb-3`}>
                            <Image
                              src={imageUrl}
                              alt={trailer.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 85vw, 320px"
                              unoptimized={trailer.poster_path === null && trailer.backdrop_path === null}
                            />
                          </div>
                        </button>
                      ) : (
                        <Link href={url} className="block">
                          <div className={`relative ${aspectRatio} rounded-lg overflow-hidden bg-gray-800 mb-3`}>
                            <Image
                              src={imageUrl}
                              alt={trailer.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 75vw, 320px"
                              unoptimized={trailer.poster_path === null && trailer.backdrop_path === null}
                            />
                          </div>
                        </Link>
                      )}

                      <Link href={url} className="block">
                        <h3 className="text-white font-semibold text-2xl md:text-xl line-clamp-1 group-hover:text-teal-400 transition drop-shadow-lg">
                          {trailer.title}
                        </h3>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      </section>

      {/* Trailer Modal - Pop-up gibi büyük ve merkezde */}
      {mounted && selectedTrailer && selectedTrailer.trailer_key && createPortal(
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeTrailer();
            }
          }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
          }}
        >
          {/* Pop-up Modal Container - Daha büyük ve merkezde */}
          <div 
            className="relative bg-black rounded-lg shadow-2xl overflow-hidden w-full max-w-[1920px] aspect-video"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Kapat Butonu - Sağ üst köşede, modal içinde - Sadece desktop'ta görünür */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTrailer();
              }}
              className="hidden md:flex absolute top-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full items-center justify-center transition-all shadow-2xl border-2 border-white/40 hover:scale-110 z-50"
              aria-label="Kapat"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Paylaş Butonu - Kapat butonunun yanında (solunda) - Sadece desktop'ta görünür */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: selectedTrailer.title,
                    text: `${selectedTrailer.title} fragmanını izle`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link kopyalandı!');
                }
              }}
              className="hidden md:flex absolute top-4 right-20 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center transition-all shadow-2xl border-2 border-white/40 hover:scale-110 z-50"
              aria-label="Paylaş"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            
            {/* Video Container - Tam genişlik ve yükseklik */}
            <div className="relative w-full h-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.trailer_key}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&playsinline=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
