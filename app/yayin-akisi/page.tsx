'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TVPlusProgram, formatTime } from '@/lib/tvplus';

export default function YayinAkisiPage() {
  const [movies, setMovies] = useState<TVPlusProgram[]>([]);
  const [series, setSeries] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/yayin-akisi/movies'),
          fetch('/api/yayin-akisi/series'),
        ]);

        const [moviesData, seriesData] = await Promise.all([
          moviesRes.json(),
          seriesRes.json(),
        ]);

        if (moviesData.success) setMovies(moviesData.data);
        if (seriesData.success) setSeries(seriesData.data);
      } catch (error) {
        console.error('Veri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentData = activeTab === 'movies' ? movies : series;

  // Kanala göre grupla
  const groupedByChannel = currentData.reduce((acc, item) => {
    if (!acc[item.channelName]) {
      acc[item.channelName] = {
        logo: item.channelLogo,
        programs: [],
      };
    }
    acc[item.channelName].programs.push(item);
    return acc;
  }, {} as Record<string, { logo: string; programs: TVPlusProgram[] }>);

  // Her kanalın programlarını saate göre sırala
  Object.keys(groupedByChannel).forEach(channel => {
    groupedByChannel[channel].programs.sort((a, b) => a.startTime - b.startTime);
  });

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
              Bugün TV'de ne var? Film ve dizi yayın akışı
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-8 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'movies'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🎬 Filmler ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`px-8 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'series'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📺 Diziler ({series.length})
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="text-white mt-4 text-lg">Yükleniyor...</p>
          </div>
        )}

        {/* Content */}
        {!loading && currentData.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-2xl backdrop-blur-sm">
            <p className="text-gray-400 text-lg">Bugün için veri bulunamadı.</p>
          </div>
        )}

        {!loading && currentData.length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedByChannel).map(([channelName, { logo, programs }]) => (
              <div
                key={channelName}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
              >
                {/* Kanal Başlığı */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/20">
                  {logo && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={logo}
                        alt={channelName}
                        fill
                        className="object-contain rounded-lg"
                        unoptimized
                      />
                    </div>
                  )}
                  <h2 className="text-white font-bold text-xl md:text-2xl">
                    {channelName}
                  </h2>
                  <span className="ml-auto text-gray-400 text-sm">
                    {programs.length} program
                  </span>
                </div>

                {/* Programlar */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group"
                    >
                      {/* Program Görseli */}
                      {program.image && (
                        <div className="relative w-full h-48">
                          <Image
                            src={program.image}
                            alt={program.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          
                          {/* Saat */}
                          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <span className="text-green-400 font-bold text-sm">
                              {formatTime(program.startTime)}
                            </span>
                          </div>

                          {/* Yayın Tipi */}
                          {program.broadcastType && (
                            <div className="absolute top-3 right-3 bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white">
                              {program.broadcastType}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Program Bilgileri */}
                      <div className="p-4">
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2">
                          {program.name}
                        </h3>
                        
                        {program.introduce && (
                          <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                            {program.introduce}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{program.genres}</span>
                          <span>
                            {formatTime(program.startTime)} - {formatTime(program.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

