'use client';

import { useState, useEffect } from 'react';
import { TVPlusProgram } from '@/lib/tvplus';
import TVPlusFullList from '@/components/TVPlusFullList';

export default function BugunHangiBelgesellerVarPage() {
  const [documentaries, setDocumentaries] = useState<TVPlusProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocumentaries() {
      try {
        const response = await fetch('/api/yayin-akisi/documentaries');
        const data = await response.json();
        
        if (data.success) {
          setDocumentaries(data.data);
        }
      } catch (error) {
        console.error('Belgeseller yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDocumentaries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Belgeseller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <TVPlusFullList
      items={documentaries}
      title="Bugün Hangi Belgeseller Var?"
      description="Bugün televizyonda yayınlanacak tüm belgeseller"
      icon="📚"
      gradientColor="from-blue-500/20 via-cyan-600/20 to-teal-600/20"
    />
  );
}

