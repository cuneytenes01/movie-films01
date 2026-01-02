import Link from 'next/link'
import { getPopularMovies, getPopularTVShows, getTopRatedMovies, getTopRatedTVShows, getTrendingAll, getPosterUrl, getBackdropUrl, Movie, TVShow } from '@/lib/tmdb'
import { createSlug } from '@/lib/slug'
import Image from 'next/image'
import TrendingCarousel from '@/components/TrendingCarousel'
import HeroSearchBar from '@/components/HeroSearchBar'
import LatestTrailers from '@/components/LatestTrailers'

async function MovieCard({ movie }: { movie: Movie }) {
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
            <p className="text-xs text-gray-300 mt-1">⭐ {movie.vote_average.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

async function TVCard({ tvShow }: { tvShow: TVShow }) {
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
            <p className="text-sm font-semibold line-clamp-2">{tvShow.name}</p>
            <p className="text-xs text-gray-300 mt-1">⭐ {tvShow.vote_average.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function Home() {
  let trendingToday = { results: [] as (Movie | TVShow)[] };
  let trendingWeek = { results: [] as (Movie | TVShow)[] };
  let popularMovies = { results: [] as Movie[] };
  let popularTVShows = { results: [] as TVShow[] };
  let topRatedMovies = { results: [] as Movie[] };
  let topRatedTVShows = { results: [] as TVShow[] };
  let error: string | null = null;

  try {
    const [trendingDayData, trendingWeekData, moviesData, tvData, topMoviesData, topTVData] = await Promise.all([
      getTrendingAll('day'),
      getTrendingAll('week'),
      getPopularMovies(1),
      getPopularTVShows(1),
      getTopRatedMovies(1),
      getTopRatedTVShows(1),
    ]);
    trendingToday = trendingDayData;
    trendingWeek = trendingWeekData;
    popularMovies = moviesData;
    popularTVShows = tvData;
    topRatedMovies = topMoviesData;
    topRatedTVShows = topTVData;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
    console.error('API Hatası:', err);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - TMDB Style */}
      <section className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-24 mb-12 overflow-hidden transition-colors duration-200">
        {/* Background Images Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 h-full">
            {trendingToday.results.slice(0, 12).map((item, index) => (
              <div key={index} className="relative overflow-hidden">
                {item.backdrop_path && (
                  <Image
                    src={getBackdropUrl(item.backdrop_path)}
                    alt={('title' in item ? item.title : item.name) || 'Backdrop'}
                    fill
                    className="object-cover scale-110 hover:scale-100 transition-transform duration-500"
                    sizes="(max-width: 768px) 25vw, 16vw"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent leading-tight">
              Hoş Geldiniz.
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto font-medium mb-8">
              Milyonlarca film, TV dizisi ve kişiyi keşfedin. Şimdi keşfetmeye başlayın.
            </p>
            <HeroSearchBar />
          </div>
        </div>
      </section>

      {/* Latest Trailers - Full width with red gradient background */}
      <LatestTrailers />

      {/* Trending Carousel - Full width with gray background */}
      {trendingToday.results.length > 0 && trendingWeek.results.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-6 mb-12 w-full">
          <TrendingCarousel 
            trendingToday={trendingToday.results.slice(0, 20)} 
            trendingWeek={trendingWeek.results.slice(0, 20)} 
          />
        </div>
      )}

      <div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300 font-semibold mb-2">⚠️ Hata Oluştu</p>
            <p className="text-red-200 text-sm">{error}</p>
            {error.includes('API key') && (
              <p className="text-red-200 text-sm mt-2">
                Lütfen <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> dosyası oluşturup <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_TMDB_API_KEY</code> değişkenini ekleyin.
              </p>
            )}
          </div>
        )}

        {/* Popüler Filmler */}
        {popularMovies.results.length > 0 && (
          <section className="mb-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Popüler Filmler</h2>
                <Link href="/movies" className="text-white/90 hover:text-white transition font-semibold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {popularMovies.results.slice(0, 12).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* En Yüksek Puanlı Filmler */}
        {topRatedMovies.results.length > 0 && (
          <section className="mb-12 bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-500 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">En Yüksek Puanlı Filmler</h2>
                <Link href="/movies" className="text-white/90 hover:text-white transition font-semibold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {topRatedMovies.results.slice(0, 12).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popüler Diziler */}
        {popularTVShows.results.length > 0 && (
          <section className="mb-12 bg-gradient-to-br from-emerald-600 via-green-600 to-lime-600 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Popüler Diziler</h2>
                <Link href="/tv" className="text-white/90 hover:text-white transition font-semibold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {popularTVShows.results.slice(0, 12).map((tvShow) => (
                  <TVCard key={tvShow.id} tvShow={tvShow} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* En Yüksek Puanlı Diziler */}
        {topRatedTVShows.results.length > 0 && (
          <section className="bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">En Yüksek Puanlı Diziler</h2>
                <Link href="/tv" className="text-white/90 hover:text-white transition font-semibold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {topRatedTVShows.results.slice(0, 12).map((tvShow) => (
                  <TVCard key={tvShow.id} tvShow={tvShow} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

