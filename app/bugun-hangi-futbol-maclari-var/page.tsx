'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiFutbolMaclariVarPage() {
  const [football, setFootball] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFootball() {
      try {
        const response = await fetch('/api/yayin-akisi/football');
        const data = await response.json();
        
        if (data.success) {
          setFootball(data.data);
        }
      } catch (error) {
        console.error('Futbol maçları yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFootball();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Futbol maçları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={football}
      title="Bugün Hangi Futbol Maçları Var?"
      description="Bugün televizyonda yayınlanacak tüm futbol maçları"
      icon="⚽"
      gradientColor="from-yellow-500/20 via-orange-600/20 to-red-600/20"
    />
  );
}

