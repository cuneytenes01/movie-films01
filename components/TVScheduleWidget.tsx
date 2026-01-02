'use client';

import { useState, useEffect } from 'react';
import { TVScheduleByChannel } from '@/lib/tv-schedule';
import Image from 'next/image';

export default function TVScheduleWidget() {
  const [scheduleByChannel, setScheduleByChannel] = useState<TVScheduleByChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series'>('all');

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true);
        const response = await fetch('/api/tv-schedule/by-channel');
        const result = await response.json();
        if (result.success) {
          setScheduleByChannel(result.data);
        }
      } catch (err) {
        console.error('TV yayın akışı hatası:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  // Tüm yayınları birleştir ve saat bazlı sırala
  const allItems = scheduleByChannel.flatMap((channel) => {
    const items = [
      ...channel.movies.map((m) => ({ ...m, channelName: channel.channel, channelLogo: channel.channelLogo })),
      ...channel.series.map((s) => ({ ...s, channelName: channel.channel, channelLogo: channel.channelLogo })),
    ];
    return items;
  })
    .filter((item) => {
      if (activeTab === 'movies') return item.type === 'film';
      if (activeTab === 'series') return item.type === 'dizi';
      return true;
    })
    .sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number);
      const [bHour, bMin] = b.time.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    })
    .slice(0, 12); // İlk 12 yayın

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Bugün için yayın bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg">📺 Bugünün Yayınları</h3>
          <div className="flex gap-1 bg-white/20 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'all' ? 'bg-white text-blue-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'movies' ? 'bg-white text-red-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Film
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'series' ? 'bg-white text-purple-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Dizi
            </button>
          </div>
        </div>
        <p className="text-white/80 text-xs">
          {allItems.length} yayın gösteriliyor
        </p>
      </div>

      {/* Yayın Listesi - Kompakt */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {allItems.map((item, index) => (
          <div
            key={index}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Saat */}
              <div className="flex-shrink-0 w-14 text-center">
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  item.type === 'film' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {item.time}
                </div>
              </div>

              {/* Kanal Logo */}
              {item.channelLogo && (
                <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <Image
                    src={item.channelLogo}
                    alt={item.channelName || ''}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Başlık ve Kanal */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.channelName}
                </p>
              </div>

              {/* Tip Badge */}
              <div className="flex-shrink-0">
                {item.type === 'film' ? (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
                    🎬
                  </span>
                ) : (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                    📺
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900 p-2 text-center border-t border-gray-200 dark:border-gray-700">
        <a
          href="/yayin-akisi"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Tüm yayın akışını gör →
        </a>
      </div>
    </div>
  );
}


