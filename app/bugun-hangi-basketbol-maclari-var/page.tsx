'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiBasketbolMaclariVarPage() {
  const [basketball, setBasketball] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBasketball() {
      try {
        const response = await fetch('/api/yayin-akisi/basketball');
        const data = await response.json();
        
        if (data.success) {
          setBasketball(data.data);
        }
      } catch (error) {
        console.error('Basketbol maçları yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBasketball();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Basketbol maçları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={basketball}
      title="Bugün Hangi Basketbol Maçları Var?"
      description="Bugün televizyonda yayınlanacak tüm basketbol maçları"
      icon="🏀"
      gradientColor="from-orange-500/20 via-red-600/20 to-pink-600/20"
    />
  );
}

