'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiDizilerVarPage() {
  const [series, setSeries] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      try {
        const response = await fetch('/api/yayin-akisi/series');
        const data = await response.json();
        
        if (data.success) {
          setSeries(data.data);
        }
      } catch (error) {
        console.error('Diziler yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSeries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Diziler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={series}
      title="Bugün Hangi Diziler Var?"
      description="Bugün televizyonda yayınlanacak tüm diziler"
      icon="📺"
      gradientColor="from-purple-500/20 via-indigo-600/20 to-blue-600/20"
    />
  );
}

