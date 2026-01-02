import { getMovieDetails, getTVShowDetails, getMovieCredits, getTVShowCredits, getMovieWatchProviders, getTVWatchProviders, getPersonDetails, getPersonCredits, getPosterUrl, getBackdropUrl, getProfileUrl } from '@/lib/tmdb'
import { getIdFromSlug, getPersonIdFromSlug, createSlug } from '@/lib/slug'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import CastCarousel from '@/components/CastCarousel'
import WatchProviders from '@/components/WatchProviders'

export const runtime = 'edge';

// Meta tag'leri oluştur
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Person slug kontrolü
  if (slug.endsWith('-filmleri-dizileri')) {
    const personId = await getPersonIdFromSlug(slug);
    if (personId) {
      try {
        const person = await getPersonDetails(personId);
        return {
          title: `${person.name} Filmleri ve Dizileri`,
          description: `${person.name} oyuncusunun yer aldığı tüm filmler ve diziler. ${person.name} filmografisi ve biyografisi.`,
          openGraph: {
            title: `${person.name} Filmleri ve Dizileri`,
            description: `${person.name} oyuncusunun yer aldığı tüm filmler ve diziler. ${person.name} filmografisi ve biyografisi.`,
            images: person.profile_path ? [getProfileUrl(person.profile_path, 'h632')] : [],
          },
        };
      } catch (error) {
        return {
          title: 'Sayfa Bulunamadı',
          description: 'Aradığınız kişi bulunamadı.',
        };
      }
    }
  }
  
  const { id, type } = await getIdFromSlug(slug);
  
  if (!id || !type) {
    return {
      title: 'Sayfa Bulunamadı',
      description: 'Aradığınız içerik bulunamadı.',
    };
  }
  
  try {
    const content = type === 'movie' 
      ? await getMovieDetails(id)
      : await getTVShowDetails(id);
    
    const title = type === 'movie' ? (content as any).title : (content as any).name;
    const typeText = type === 'movie' ? 'filmi' : 'dizisi';
    
    return {
      title: `${title} hangi platformda? nerede izlenir!`,
      description: `${title} ${typeText}nin yayınlandığı platforma buradan ulaşabilirsiniz. ${title} ${typeText} hangi platform'da. İşte konusu ve oyuncuları`,
      openGraph: {
        title: `${title} hangi platformda? nerede izlenir!`,
        description: `${title} ${typeText}nin yayınlandığı platforma buradan ulaşabilirsiniz. ${title} ${typeText} hangi platform'da. İşte konusu ve oyuncuları`,
        images: content.poster_path ? [getPosterUrl(content.poster_path, 'w500')] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Sayfa Bulunamadı',
      description: 'Aradığınız içerik bulunamadı.',
    };
  }
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Person slug kontrolü (-filmleri-dizileri ile bitiyorsa person slug'ıdır)
  if (slug.endsWith('-filmleri-dizileri')) {
    const personId = await getPersonIdFromSlug(slug);
    if (!personId) {
      notFound();
    }
    
    let person;
    let credits;
    
    try {
      [person, credits] = await Promise.all([
        getPersonDetails(personId),
        getPersonCredits(personId)
      ]);
    } catch (error) {
      notFound();
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
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
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

            <div className="flex-1 bg-gray-800/95 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                {person.name}
              </h1>

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

          {knownFor.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Bilinen Yapımlar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {knownFor.map((item) => {
                  const title = 'title' in item ? item.title : item.name;
                  const date = 'release_date' in item ? item.release_date : item.first_air_date;
                  const url = item.media_type === 'movie' ? `/${createSlug(item.title, 'movie')}` : `/${createSlug(item.name, 'tv')}`;
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
    );
  }
  
  // Slug'dan ID ve tip'i çıkar
  const { id, type } = await getIdFromSlug(slug);
  
  if (!id || !type) {
    notFound();
  }
  
  let content: any;
  let credits: any;
  let watchProviders: any;
  let contentTitle: string;
  
  try {
    if (type === 'movie') {
      const [movieData, creditsData, providersData] = await Promise.all([
        getMovieDetails(id),
        getMovieCredits(id),
        getMovieWatchProviders(id)
      ]);
      content = movieData;
      credits = creditsData;
      watchProviders = providersData;
      contentTitle = movieData.title;
    } else {
      const [tvShowData, creditsData, providersData] = await Promise.all([
        getTVShowDetails(id),
        getTVShowCredits(id),
        getTVWatchProviders(id)
      ]);
      content = tvShowData;
      credits = creditsData;
      watchProviders = providersData;
      contentTitle = tvShowData.name;
    }
  } catch (error) {
    notFound();
  }

  const isMovie = type === 'movie';
  const releaseYear = isMovie 
    ? new Date(content.release_date).getFullYear()
    : new Date(content.first_air_date).getFullYear();
  
  const runtimeHours = isMovie && content.runtime ? Math.floor(content.runtime / 60) : 0;
  const runtimeMinutes = isMovie && content.runtime ? content.runtime % 60 : 0;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src={getBackdropUrl(content.backdrop_path)}
          alt={contentTitle}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80" />
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <Link 
              href={isMovie ? "/movies" : "/tv"} 
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
                src={getPosterUrl(content.poster_path, 'w500')}
                alt={contentTitle}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {contentTitle}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-white">
              <span className="flex items-center gap-1 font-semibold">
                <span className="text-yellow-400">⭐</span> {content.vote_average.toFixed(1)}
                <span className="text-sm text-gray-400 font-normal">({content.vote_count.toLocaleString()} oy)</span>
              </span>
              <span className="text-gray-400">•</span>
              <span>{releaseYear}</span>
              {isMovie && content.runtime > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{runtimeHours}s {runtimeMinutes}dk</span>
                </>
              )}
              {!isMovie && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{content.number_of_seasons} Sezon</span>
                  <span className="text-gray-400">•</span>
                  <span>{content.number_of_episodes} Bölüm</span>
                </>
              )}
            </div>

            {/* Genres */}
            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {content.genres.map((genre: { id: number; name: string }) => (
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
              <p className="text-gray-100 leading-relaxed text-base md:text-lg">{content.overview || 'Özet bulunamadı.'}</p>
            </div>

            {/* Production Companies */}
            {content.production_companies && content.production_companies.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-white">Yapım Şirketleri</h2>
                <div className="flex flex-wrap gap-4">
                  {content.production_companies.map((company: { id: number; name: string }) => (
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
                contentId={content.id}
                contentType={type}
                contentTitle={contentTitle}
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

