import { getMovieDetails, getMovieCredits, getMovieWatchProviders, getPosterUrl, getBackdropUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CastCarousel from '@/components/CastCarousel'
import WatchProviders from '@/components/WatchProviders'

export const runtime = 'edge';

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let movie;
  let credits;
  let watchProviders;
  try {
    const [movieData, creditsData, providersData] = await Promise.all([
      getMovieDetails(parseInt(id)),
      getMovieCredits(parseInt(id)),
      getMovieWatchProviders(parseInt(id))
    ]);
    movie = movieData;
    credits = creditsData;
    watchProviders = providersData;
  } catch (error) {
    notFound();
  }

  const releaseYear = new Date(movie.release_date).getFullYear();
  const runtimeHours = Math.floor(movie.runtime / 60);
  const runtimeMinutes = movie.runtime % 60;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80" />
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <Link 
              href="/movies" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition backdrop-blur-sm border border-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-48 md:w-64 h-72 md:h-96 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10">
              <Image
                src={getPosterUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-white">
              <span className="flex items-center gap-1 font-semibold">
                <span className="text-yellow-400">⭐</span> {movie.vote_average.toFixed(1)}
                <span className="text-sm text-gray-400 font-normal">({movie.vote_count.toLocaleString()} oy)</span>
              </span>
              <span className="text-gray-400">•</span>
              <span>{releaseYear}</span>
              {movie.runtime > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{runtimeHours}s {runtimeMinutes}dk</span>
                </>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-3 text-white">Özet</h2>
              <p className="text-gray-100 leading-relaxed text-base md:text-lg">{movie.overview || 'Özet bulunamadı.'}</p>
            </div>

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-white">Yapım Şirketleri</h2>
                <div className="flex flex-wrap gap-4">
                  {movie.production_companies.map((company) => (
                    <div key={company.id} className="text-gray-200 font-medium">
                      {company.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watch Providers */}
            {watchProviders && watchProviders.length > 0 && (
              <WatchProviders 
                providers={watchProviders} 
                contentId={movie.id}
                contentType="movie"
                contentTitle={movie.title}
              />
            )}
          </div>
        </div>

        {/* Top Billed Cast */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <CastCarousel cast={credits.cast} />
        )}
      </div>
    </div>
  )
}

