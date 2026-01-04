'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusSlider from '@/components/TVPlusSlider';

type TabType = 'series' | 'movies' | 'documentaries' | 'sports' | 'football' | 'basketball';

export default function YayinAkisiPage() {
  const [series, setSeries] = useState<TVPlusProgram[]>([]);
  const [movies, setMovies] = useState<TVPlusProgram[]>([]);
  const [documentaries, setDocumentaries] = useState<TVPlusProgram[]>([]);
  const [sports, setSports] = useState<TVPlusProgram[]>([]);
  const [football, setFootball] = useState<TVPlusProgram[]>([]);
  const [basketball, setBasketball] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('series');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        const [seriesRes, moviesRes, docsRes, sportsRes, footballRes, basketballRes] = await Promise.all([
          fetch('/api/yayin-akisi/series'),
          fetch('/api/yayin-akisi/movies'),
          fetch('/api/yayin-akisi/documentaries'),
          fetch('/api/yayin-akisi/sports'),
          fetch('/api/yayin-akisi/football'),
          fetch('/api/yayin-akisi/basketball'),
        ]);

        const [seriesData, moviesData, docsData, sportsData, footballData, basketballData] = await Promise.all([
          seriesRes.json(),
          moviesRes.json(),
          docsRes.json(),
          sportsRes.json(),
          footballRes.json(),
          basketballRes.json(),
        ]);

        if (seriesData.success) setSeries(seriesData.data);
        if (moviesData.success) setMovies(moviesData.data);
        if (docsData.success) setDocumentaries(docsData.data);
        if (sportsData.success) setSports(sportsData.data);
        if (footballData.success) setFootball(footballData.data);
        if (basketballData.success) setBasketball(basketballData.data);
      } catch (error) {
        console.error('Veri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const tabs = [
    { id: 'series' as TabType, label: '📺 Diziler', count: series.length, color: 'from-purple-500 to-indigo-600' },
    { id: 'movies' as TabType, label: '🎬 Filmler', count: movies.length, color: 'from-red-500 to-pink-600' },
    { id: 'documentaries' as TabType, label: '📚 Belgeseller', count: documentaries.length, color: 'from-blue-500 to-cyan-600' },
    { id: 'sports' as TabType, label: '⚽ Spor', count: sports.length, color: 'from-green-500 to-emerald-600' },
    { id: 'football' as TabType, label: '⚽ Futbol', count: football.length, color: 'from-yellow-500 to-orange-600' },
    { id: 'basketball' as TabType, label: '🏀 Basketbol', count: basketball.length, color: 'from-orange-500 to-red-600' },
  ];

  const getSliderData = () => {
    switch (activeTab) {
      case 'series':
        return { items: series.slice(0, 10), link: '/bugun-hangi-diziler-var', title: 'Bugünkü Diziler' };
      case 'movies':
        return { items: movies.slice(0, 10), link: '/bugun-hangi-filmler-var', title: 'Bugünkü Filmler' };
      case 'documentaries':
        return { items: documentaries.slice(0, 10), link: '/bugun-hangi-belgeseller-var', title: 'Bugünkü Belgeseller' };
      case 'sports':
        return { items: sports.slice(0, 10), link: '/bugun-hangi-spor-yayinlari-var', title: 'Bugünkü Spor Yayınları' };
      case 'football':
        return { items: football.slice(0, 10), link: '/bugun-hangi-futbol-maclari-var', title: 'Bugünkü Futbol Maçları' };
      case 'basketball':
        return { items: basketball.slice(0, 10), link: '/bugun-hangi-basketbol-maclari-var', title: 'Bugünkü Basketbol Maçları' };
      default:
        return { items: [], link: '', title: '' };
    }
  };

  const sliderData = getSliderData();

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
              Bugün TV'de ne var? Film, dizi, belgesel ve spor yayınları
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="text-white mt-4 text-lg">Yükleniyor...</p>
          </div>
        )}

        {/* Slider */}
        {!loading && (
          <TVPlusSlider
            items={sliderData.items}
            viewAllLink={sliderData.link}
            title={sliderData.title}
          />
        )}
      </div>
    </div>
  );
}
