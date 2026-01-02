const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface TVShowDetails extends TVShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface SearchResults {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonMovieCredit {
  id: number;
  title: string;
  character?: string;
  job?: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  media_type: 'movie';
}

export interface PersonTVCredit {
  id: number;
  name: string;
  character?: string;
  job?: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  media_type: 'tv';
}

export interface PersonCredits {
  cast: (PersonMovieCredit | PersonTVCredit)[];
  crew: (PersonMovieCredit | PersonTVCredit)[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface Video {
  key: string;
  name: string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
  site: 'YouTube' | 'Vimeo';
  size: 360 | 480 | 720 | 1080;
  official: boolean;
  published_at: string;
}

export interface MovieVideos {
  id: number;
  results: Video[];
}

export interface TVVideos {
  id: number;
  results: Video[];
}

// API istekleri için yardımcı fonksiyon
async function fetchFromTMDB(endpoint: string): Promise<any> {
  if (!API_KEY) {
    throw new Error('TMDB API key bulunamadı. Lütfen .env.local dosyasında NEXT_PUBLIC_TMDB_API_KEY değişkenini ayarlayın.');
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  const response = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=tr-TR`, {
    next: { revalidate: 3600 } // 1 saat cache
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TMDB API hatası: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

// Popüler filmleri getir
export async function getPopularMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/movie/popular?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// Popüler TV dizilerini getir
export async function getPopularTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/tv/popular?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// En yüksek puanlı filmleri getir
export async function getTopRatedMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/movie/top_rated?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// En yüksek puanlı TV dizilerini getir
export async function getTopRatedTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/tv/top_rated?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// Yayında olan TV dizilerini getir
export async function getOnTheAirTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// Şu anda sinemada olan filmleri getir
export async function getNowPlayingMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/movie/now_playing?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// Bugün yayınlanan TV dizilerini getir
export async function getAiringTodayTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
  const data = await fetchFromTMDB(`/tv/airing_today?page=${page}`);
  return { results: data.results, total_pages: data.total_pages };
}

// Trending içerikleri getir (günlük veya haftalık)
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<{ results: Movie[] }> {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
  return { results: data.results };
}

export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'day'): Promise<{ results: TVShow[] }> {
  const data = await fetchFromTMDB(`/trending/tv/${timeWindow}`);
  return { results: data.results };
}

export async function getTrendingAll(timeWindow: 'day' | 'week' = 'day'): Promise<{ results: (Movie | TVShow)[] }> {
  const data = await fetchFromTMDB(`/trending/all/${timeWindow}`);
  return { results: data.results };
}

// Film detaylarını getir
export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return await fetchFromTMDB(`/movie/${id}`);
}

// TV dizisi detaylarını getir
export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
  return await fetchFromTMDB(`/tv/${id}`);
}

// Arama yap
export async function searchContent(query: string, page: number = 1): Promise<SearchResults> {
  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  return data;
}

// Person arama yap
export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonSearchResults {
  page: number;
  results: PersonSearchResult[];
  total_pages: number;
  total_results: number;
}

export async function searchPerson(query: string, page: number = 1): Promise<PersonSearchResults> {
  const data = await fetchFromTMDB(`/search/person?query=${encodeURIComponent(query)}&page=${page}`);
  return data;
}

// Film cast ve crew bilgilerini getir
export async function getMovieCredits(id: number): Promise<Credits> {
  return await fetchFromTMDB(`/movie/${id}/credits`);
}

// TV dizisi cast ve crew bilgilerini getir
export async function getTVShowCredits(id: number): Promise<Credits> {
  return await fetchFromTMDB(`/tv/${id}/credits`);
}

// Film watch providers bilgilerini getir (Türkiye bölgesi)
export async function getMovieWatchProviders(id: number): Promise<WatchProvider[]> {
  try {
    const data = await fetchFromTMDB(`/movie/${id}/watch/providers`);
    // Türkiye (TR) bölgesi için flatrate (streaming) provider'ları döndür
    if (data.results && data.results.TR && data.results.TR.flatrate) {
      return data.results.TR.flatrate;
    }
    return [];
  } catch (error) {
    console.error('Watch providers yüklenemedi:', error);
    return [];
  }
}

// Film watch providers bilgilerini getir (tüm bilgiler - rent, buy, flatrate)
export async function getMovieWatchProvidersFull(id: number): Promise<{
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}> {
  try {
    const data = await fetchFromTMDB(`/movie/${id}/watch/providers`);
    if (data.results && data.results.TR) {
      return {
        flatrate: data.results.TR.flatrate || [],
        rent: data.results.TR.rent || [],
        buy: data.results.TR.buy || [],
      };
    }
    return {};
  } catch (error) {
    console.error('Watch providers yüklenemedi:', error);
    return {};
  }
}

// TV dizisi watch providers bilgilerini getir (Türkiye bölgesi)
export async function getTVWatchProviders(id: number): Promise<WatchProvider[]> {
  try {
    const data = await fetchFromTMDB(`/tv/${id}/watch/providers`);
    // Türkiye (TR) bölgesi için flatrate (streaming) provider'ları döndür
    if (data.results && data.results.TR && data.results.TR.flatrate) {
      return data.results.TR.flatrate;
    }
    return [];
  } catch (error) {
    console.error('Watch providers yüklenemedi:', error);
    return [];
  }
}

// TV dizisi watch providers bilgilerini getir (tüm bilgiler - rent, buy, flatrate)
export async function getTVWatchProvidersFull(id: number): Promise<{
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}> {
  try {
    const data = await fetchFromTMDB(`/tv/${id}/watch/providers`);
    if (data.results && data.results.TR) {
      return {
        flatrate: data.results.TR.flatrate || [],
        rent: data.results.TR.rent || [],
        buy: data.results.TR.buy || [],
      };
    }
    return {};
  } catch (error) {
    console.error('Watch providers yüklenemedi:', error);
    return {};
  }
}

// Kişi detaylarını getir
export async function getPersonDetails(id: number): Promise<PersonDetails> {
  return await fetchFromTMDB(`/person/${id}`);
}

// Kişinin filmografisini getir
export async function getPersonCredits(id: number): Promise<PersonCredits> {
  return await fetchFromTMDB(`/person/${id}/combined_credits`);
}

// Film videolarını getir
export async function getMovieVideos(id: number): Promise<MovieVideos> {
  return await fetchFromTMDB(`/movie/${id}/videos`);
}

// TV dizisi videolarını getir
export async function getTVVideos(id: number): Promise<TVVideos> {
  return await fetchFromTMDB(`/tv/${id}/videos`);
}

// Film türlerini getir
export async function getMovieGenres(): Promise<{ genres: { id: number; name: string }[] }> {
  return await fetchFromTMDB(`/genre/movie/list`);
}

// TV dizisi türlerini getir
export async function getTVGenres(): Promise<{ genres: { id: number; name: string }[] }> {
  return await fetchFromTMDB(`/genre/tv/list`);
}

// Filtrelenmiş filmleri getir
export async function discoverMovies(params: {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
}): Promise<{ results: Movie[]; total_pages: number; total_results: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', (params.page || 1).toString());
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.with_genres) queryParams.append('with_genres', params.with_genres);
  if (params['primary_release_date.gte']) queryParams.append('primary_release_date.gte', params['primary_release_date.gte']);
  if (params['primary_release_date.lte']) queryParams.append('primary_release_date.lte', params['primary_release_date.lte']);
  if (params['vote_average.gte']) queryParams.append('vote_average.gte', params['vote_average.gte'].toString());
  if (params['vote_count.gte']) queryParams.append('vote_count.gte', params['vote_count.gte'].toString());
  if (params.with_runtime_gte) queryParams.append('with_runtime.gte', params.with_runtime_gte.toString());
  if (params.with_runtime_lte) queryParams.append('with_runtime.lte', params.with_runtime_lte.toString());
  
  const data = await fetchFromTMDB(`/discover/movie?${queryParams.toString()}`);
  return { results: data.results, total_pages: data.total_pages, total_results: data.total_results };
}

// Filtrelenmiş TV dizilerini getir
export async function discoverTVShows(params: {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  'air_date.gte'?: string;
  'air_date.lte'?: string;
  with_networks?: string;
  with_original_language?: string;
}): Promise<{ results: TVShow[]; total_pages: number; total_results: number }> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', (params.page || 1).toString());
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.with_genres) queryParams.append('with_genres', params.with_genres);
  if (params['first_air_date.gte']) queryParams.append('first_air_date.gte', params['first_air_date.gte']);
  if (params['first_air_date.lte']) queryParams.append('first_air_date.lte', params['first_air_date.lte']);
  if (params['vote_average.gte']) queryParams.append('vote_average.gte', params['vote_average.gte'].toString());
  if (params['vote_count.gte']) queryParams.append('vote_count.gte', params['vote_count.gte'].toString());
  if (params.with_runtime_gte) queryParams.append('with_runtime.gte', params.with_runtime_gte.toString());
  if (params.with_runtime_lte) queryParams.append('with_runtime.lte', params.with_runtime_lte.toString());
  if (params['air_date.gte']) queryParams.append('air_date.gte', params['air_date.gte']);
  if (params['air_date.lte']) queryParams.append('air_date.lte', params['air_date.lte']);
  if (params.with_networks) queryParams.append('with_networks', params.with_networks);
  if (params.with_original_language) queryParams.append('with_original_language', params.with_original_language);
  
  const data = await fetchFromTMDB(`/discover/tv?${queryParams.toString()}`);
  return { results: data.results, total_pages: data.total_pages, total_results: data.total_results };
}

// Placeholder görsel (SVG data URI)
const PLACEHOLDER_POSTER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YjZiNmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7ZyZWwgWW9rPC90ZXh0Pjwvc3ZnPg==';
const PLACEHOLDER_BACKDROP = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiMxYTFhMWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjNmI2YjZiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbCBZb2s8L3RleHQ+PC9zdmc+';

// Görsel URL'leri oluştur
export function getPosterUrl(posterPath: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500'): string {
  if (!posterPath) return PLACEHOLDER_POSTER;
  return `${IMAGE_BASE_URL}/${size}${posterPath}`;
}

export function getBackdropUrl(backdropPath: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!backdropPath) return PLACEHOLDER_BACKDROP;
  return `${IMAGE_BASE_URL}/${size}${backdropPath}`;
}

export function getProfileUrl(profilePath: string | null, size: 'w45' | 'w185' | 'w300' | 'h632' | 'original' = 'w185'): string {
  if (!profilePath) return PLACEHOLDER_POSTER;
  return `${IMAGE_BASE_URL}/${size}${profilePath}`;
}

// Provider logo URL'i oluştur
export function getProviderLogoUrl(logoPath: string | null, size: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original' = 'w45'): string {
  if (!logoPath) return '';
  return `${IMAGE_BASE_URL}/${size}${logoPath}`;
}

