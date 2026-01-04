'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TodayMatch, TodaySeriesItem, TodayMovieItem } from '@/lib/tv-schedule';
import { getChannelLogoUrl } from '@/lib/tv-schedule';

export default function YayinAkisiPage() {
  const [todayMatches, setTodayMatches] = useState<TodayMatch[]>([]);
  const [todaySeries, setTodaySeries] = useState<TodaySeriesItem[]>([]);
  const [todayMovies, setTodayMovies] = useState<TodayMovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<'futbol' | 'basketbol'>('futbol');
  const [activeSection, setActiveSection] = useState<'matches' | 'series' | 'movies'>('matches');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const [matchesRes, seriesRes, moviesRes] = await Promise.all([
          fetch(`/api/tv-schedule/today-matches?sport=${sportFilter}`),
          fetch('/api/tv-schedule/today-series'),
          fetch('/api/tv-schedule/today-movies'),
        ]);

        const [matchesData, seriesData, moviesData] = await Promise.all([
          matchesRes.json(),
          seriesRes.json(),
          moviesRes.json(),
        ]);

        if (matchesData.success) setTodayMatches(matchesData.data);
        if (seriesData.success) setTodaySeries(seriesData.data);
        if (moviesData.success) setTodayMovies(moviesData.data);
      } catch (error) {
        console.error('Veri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sportFilter]);

  // Maçları kanallara göre grupla
  const matchesByChannel = todayMatches.reduce((acc, match) => {
    match.channels.forEach(channel => {
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(match);
    });
    return acc;
  }, {} as Record<string, TodayMatch[]>);

  // Dizileri kanallara göre grupla
  const seriesByChannel = todaySeries.reduce((acc, series) => {
    if (!acc[series.channel]) {
      acc[series.channel] = [];
    }
    acc[series.channel].push(series);
    return acc;
  }, {} as Record<string, TodaySeriesItem[]>);

  // Filmleri kanallara göre grupla
  const moviesByChannel = todayMovies.reduce((acc, movie) => {
    if (!acc[movie.channel]) {
      acc[movie.channel] = [];
    }
    acc[movie.channel].push(movie);
    return acc;
  }, {} as Record<string, TodayMovieItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              📺 Yayın Akışı
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              Bugün TV'de ne var? Maçlar, diziler ve filmler
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Section Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveSection('matches')}
              className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'matches'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              ⚽ Maçlar ({todayMatches.length})
            </button>
            <button
              onClick={() => setActiveSection('series')}
              className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'series'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              📺 Diziler ({todaySeries.length})
            </button>
            <button
              onClick={() => setActiveSection('movies')}
              className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${
                activeSection === 'movies'
                  ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              🎬 Filmler ({todayMovies.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mb-4"></div>
            <p className="text-gray-400 text-lg">Yükleniyor...</p>
          </div>
        )}

        {/* Maçlar Bölümü */}
        {!loading && activeSection === 'matches' && (
          <div className="space-y-6">
            {/* Spor Filtresi */}
            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={() => setSportFilter('futbol')}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  sportFilter === 'futbol'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                ⚽ Futbol
              </button>
              <button
                onClick={() => setSportFilter('basketbol')}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  sportFilter === 'basketbol'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🏀 Basketbol
              </button>
            </div>

            {todayMatches.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm">
                <p className="text-gray-400 text-lg">Bugün için maç bulunamadı.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(matchesByChannel).map(([channel, matches]) => (
                  <div
                    key={channel}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300"
                  >
                    <h3 className="text-white font-bold text-lg mb-4 pb-3 border-b border-white/20">
                      {channel}
                    </h3>
                    <div className="space-y-3">
                      {matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="text-green-400 font-bold text-sm mb-2">
                            {match.time}
                          </div>
                          <div className="text-white font-semibold text-base">
                            {match.homeTeam} <span className="text-gray-400 mx-2">vs</span> {match.awayTeam}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diziler Bölümü */}
        {!loading && activeSection === 'series' && (
          <div className="space-y-6">
            {todaySeries.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm">
                <p className="text-gray-400 text-lg">Bugün için dizi bulunamadı.</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
                <h2 className="text-white font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-white/20">
                  Bugünkü Diziler
                </h2>
                <div className="space-y-2">
                  {todaySeries
                    .sort((a, b) => {
                      const [aHour, aMin] = a.time.split(':').map(Number);
                      const [bHour, bMin] = b.time.split(':').map(Number);
                      return aHour * 60 + aMin - (bHour * 60 + bMin);
                    })
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 py-3 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0"
                      >
                        <span className="text-purple-400 font-bold text-base md:text-lg min-w-[70px] md:min-w-[80px]">
                          {item.time}
                        </span>
                        <span className="text-white font-semibold text-sm md:text-base flex-1">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {getChannelLogoUrl(item.channel) && (
                            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-white/10 hidden md:block">
                              <Image
                                src={getChannelLogoUrl(item.channel)!}
                                alt={item.channel}
                                fill
                                className="object-contain p-1"
                                unoptimized
                              />
                            </div>
                          )}
                          <span className="text-gray-300 text-xs md:text-sm font-medium min-w-[80px] md:min-w-[120px] text-right">
                            {item.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filmler Bölümü */}
        {!loading && activeSection === 'movies' && (
          <div className="space-y-6">
            {todayMovies.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm">
                <p className="text-gray-400 text-lg">Bugün için film bulunamadı.</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
                <h2 className="text-white font-bold text-xl md:text-2xl mb-6 pb-4 border-b border-white/20">
                  Bu Akşamki Filmler
                </h2>
                <div className="space-y-2">
                  {todayMovies
                    .sort((a, b) => {
                      const [aHour, aMin] = a.time.split(':').map(Number);
                      const [bHour, bMin] = b.time.split(':').map(Number);
                      return aHour * 60 + aMin - (bHour * 60 + bMin);
                    })
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 py-3 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0"
                      >
                        <span className="text-red-400 font-bold text-base md:text-lg min-w-[70px] md:min-w-[80px]">
                          {item.time}
                        </span>
                        <span className="text-white font-semibold text-sm md:text-base flex-1">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {getChannelLogoUrl(item.channel) && (
                            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-white/10 hidden md:block">
                              <Image
                                src={getChannelLogoUrl(item.channel)!}
                                alt={item.channel}
                                fill
                                className="object-contain p-1"
                                unoptimized
                              />
                            </div>
                          )}
                          <span className="text-gray-300 text-xs md:text-sm font-medium min-w-[80px] md:min-w-[120px] text-right">
                            {item.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
