'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiFilmlerVarPage() {
  const [movies, setMovies] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        const response = await fetch('/api/yayin-akisi/movies');
        const data = await response.json();
        
        if (data.success) {
          setMovies(data.data);
        }
      } catch (error) {
        console.error('Filmler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Filmler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={movies}
      title="Bugün Hangi Filmler Var?"
      description="Bugün televizyonda yayınlanacak tüm filmler"
      icon="🎬"
      gradientColor="from-red-500/20 via-pink-600/20 to-purple-600/20"
    />
  );
}

