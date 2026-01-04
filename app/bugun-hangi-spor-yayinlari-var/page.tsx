'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiSporYayinlariVarPage() {
  const [sports, setSports] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSports() {
      try {
        const response = await fetch('/api/yayin-akisi/sports');
        const data = await response.json();
        
        if (data.success) {
          setSports(data.data);
        }
      } catch (error) {
        console.error('Spor yayınları yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Spor yayınları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={sports}
      title="Bugün Hangi Spor Yayınları Var?"
      description="Bugün televizyonda yayınlanacak tüm spor programları"
      icon="⚽"
      gradientColor="from-green-500/20 via-emerald-600/20 to-teal-600/20"
    />
  );
}

