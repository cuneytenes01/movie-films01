import { NextRequest, NextResponse } from 'next/server'
import { 
  getPopularMovies, 
  getPopularTVShows, 
  getNowPlayingMovies, 
  getOnTheAirTVShows,
  getMovieVideos,
  getTVVideos,
  getMovieWatchProviders,
  getTVWatchProviders,
  getMovieWatchProvidersFull,
  getTVWatchProvidersFull,
  Movie,
  TVShow
} from '@/lib/tmdb'

export const runtime = 'edge';

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

async function getTrailersForContent(
  items: (Movie | TVShow)[],
  type: 'movie' | 'tv',
  maxItems: number = 50
): Promise<TrailerItem[]> {
  const trailers: TrailerItem[] = [];
  
  // TMDB'nin sıralamasını koru - sadece ilk maxItems kadar işle
  const itemsToProcess = items.slice(0, maxItems);
  
  // Paralel olarak video'ları çek (batch processing)
  const batchSize = 10;
  for (let i = 0; i < itemsToProcess.length; i += batchSize) {
    const batch = itemsToProcess.slice(i, i + batchSize);
    const batchPromises = batch.map(async (item, index) => {
      try {
        const videos = type === 'movie' 
          ? await getMovieVideos(item.id)
          : await getTVVideos(item.id);
        
        // Videos veya results yoksa null döndür
        if (!videos || !videos.results || !Array.isArray(videos.results) || videos.results.length === 0) {
          return null;
        }
        
        // Trailer'ı bul - Sadece YouTube'da olan trailer'ları kabul et (TMDB gibi)
        // Öncelik sırası: Official Trailer > Trailer > Teaser > Clip
        const results = videos.results as any[];
        const trailer = results.find(
          (v: any) => v && v.type === 'Trailer' && v.site === 'YouTube' && v.official
        ) || results.find(
          (v: any) => v && v.type === 'Trailer' && v.site === 'YouTube'
        ) || results.find(
          (v: any) => v && v.type === 'Teaser' && v.site === 'YouTube'
        ) || results.find(
          (v: any) => v && v.type === 'Clip' && v.site === 'YouTube'
        );
        
        // Sadece YouTube trailer'ı olan içerikleri ekle (TMDB gibi)
        if (!trailer || trailer.site !== 'YouTube') {
          return null;
        }
        
        const title = 'title' in item ? item.title : item.name;
        
        // Trailer varsa ekle - TMDB'nin sıralamasını korumak için orijinal index'i de sakla
        return {
          id: item.id,
          title,
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          release_date: 'release_date' in item ? item.release_date : undefined,
          first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
          media_type: type,
          trailer_key: trailer.key,
          trailer_name: trailer.name,
          _originalIndex: i + index, // Sıralamayı korumak için
        } as TrailerItem & { _originalIndex: number };
      } catch (error) {
        // Hata durumunda null döndür (trailer'ı olmayan içerikleri gösterme)
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    // Sadece trailer'ı olan içerikleri ekle (null olanları filtrele)
    const validTrailers = batchResults.filter((item): item is TrailerItem & { _originalIndex: number } => item !== null);
    trailers.push(...validTrailers);
    
    // Yeterli trailer bulunduysa dur (20'ye ulaşınca)
    if (trailers.length >= 20) break;
  }
  
  // TMDB'nin orijinal sıralamasını koru
  trailers.sort((a, b) => {
    const aIndex = (a as any)._originalIndex ?? 0;
    const bIndex = (b as any)._originalIndex ?? 0;
    return aIndex - bIndex;
  });
  
  // _originalIndex'i kaldır ve ilk 20'yi döndür
  return trailers.slice(0, 20).map((item) => {
    if (!item) return null;
    const { _originalIndex, ...rest } = item as any;
    return rest as TrailerItem;
  }).filter((item): item is TrailerItem => item !== null);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'popular';
    
    let trailers: TrailerItem[] = [];
    
    switch (filter) {
      case 'popular': {
        // TMDB gibi: Daha fazla sayfa çek ve sadece trailer'ı olanları göster
        const [moviesPage1, moviesPage2, moviesPage3, tvPage1, tvPage2, tvPage3] = await Promise.all([
          getPopularMovies(1),
          getPopularMovies(2),
          getPopularMovies(3),
          getPopularTVShows(1),
          getPopularTVShows(2),
          getPopularTVShows(3),
        ]);
        
        // TMDB'nin sıralamasını koru - tüm sayfaları birleştir
        const allMovies = [...moviesPage1.results, ...moviesPage2.results, ...moviesPage3.results];
        const allTVShows = [...tvPage1.results, ...tvPage2.results, ...tvPage3.results];
        
        // Daha fazla içerik işle (trailer'ı olmayanları filtrelemek için)
        const [movieTrailers, tvTrailers] = await Promise.all([
          getTrailersForContent(allMovies, 'movie', 60),
          getTrailersForContent(allTVShows, 'tv', 60),
        ]);
        
        // TMDB'nin sıralamasını koru - önce filmler, sonra diziler
        trailers = [...movieTrailers, ...tvTrailers].slice(0, 20);
        break;
      }
      
      case 'streaming': {
        // TMDB gibi: Streaming provider'ı olan içerikleri bul
        const [moviesPage1, moviesPage2, moviesPage3, tvPage1, tvPage2, tvPage3] = await Promise.all([
          getPopularMovies(1),
          getPopularMovies(2),
          getPopularMovies(3),
          getPopularTVShows(1),
          getPopularTVShows(2),
          getPopularTVShows(3),
        ]);
        
        const allItems = [...moviesPage1.results, ...moviesPage2.results, ...moviesPage3.results, ...tvPage1.results, ...tvPage2.results, ...tvPage3.results];
        
        // Watch providers'ı olan içerikleri filtrele (flatrate/streaming için)
        const itemsWithProviders: (Movie | TVShow)[] = [];
        const checkPromises = allItems.slice(0, 100).map(async (item) => {
          try {
            const providers = 'title' in item
              ? await getMovieWatchProviders(item.id)
              : await getTVWatchProviders(item.id);
            
            if (providers.length > 0) {
              return item;
            }
          } catch (error) {
            // Continue
          }
          return null;
        });
        
        const results = await Promise.all(checkPromises);
        const validItems = results.filter((item): item is Movie | TVShow => item !== null);
        itemsWithProviders.push(...validItems);
        
        // TMDB'nin sıralamasını koru
        const movieItems = itemsWithProviders.filter(item => 'title' in item) as Movie[];
        const tvItems = itemsWithProviders.filter(item => 'name' in item) as TVShow[];
        
        const [movieTrailers, tvTrailers] = await Promise.all([
          getTrailersForContent(movieItems, 'movie', 60),
          getTrailersForContent(tvItems, 'tv', 60),
        ]);
        
        // TMDB'nin sıralamasını koru
        trailers = [...movieTrailers, ...tvTrailers].slice(0, 20);
        break;
      }
      
      case 'on-tv': {
        // TMDB gibi: On the air TV dizilerini çek
        const [page1, page2, page3, page4] = await Promise.all([
          getOnTheAirTVShows(1),
          getOnTheAirTVShows(2),
          getOnTheAirTVShows(3),
          getOnTheAirTVShows(4),
        ]);
        // TMDB'nin sıralamasını koru
        const allTVShows = [...page1.results, ...page2.results, ...page3.results, ...page4.results];
        trailers = await getTrailersForContent(allTVShows, 'tv', 80);
        break;
      }
      
      case 'in-theaters': {
        // TMDB gibi: Now playing filmleri çek
        const [page1, page2, page3, page4] = await Promise.all([
          getNowPlayingMovies(1),
          getNowPlayingMovies(2),
          getNowPlayingMovies(3),
          getNowPlayingMovies(4),
        ]);
        // TMDB'nin sıralamasını koru
        const allMovies = [...page1.results, ...page2.results, ...page3.results, ...page4.results];
        trailers = await getTrailersForContent(allMovies, 'movie', 80);
        break;
      }
      
      default:
        return NextResponse.json({ error: 'Invalid filter' }, { status: 400 });
    }
    
    return NextResponse.json({ results: trailers });
  } catch (error) {
    console.error('Trailers API hatası:', error);
    return NextResponse.json({ error: 'Trailer\'lar yüklenemedi' }, { status: 500 });
  }
}

