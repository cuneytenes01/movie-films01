'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TrailerPlayerProps {
  trailerKey: string;
  title: string;
}

export default function TrailerPlayer({ trailerKey, title }: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll kontrolü
  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında body scroll'unu engelle
      document.body.style.overflow = 'hidden';
      // Sayfa içeriğini gizlemek için body'ye class ekle
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      return () => {
        // Modal kapandığında geri al
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [isOpen]);

  if (!trailerKey) return null;
  
  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all font-bold text-xl shadow-2xl hover:shadow-red-500/50 hover:scale-105 transform duration-300 backdrop-blur-sm border-2 border-white/20"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="relative z-10">Fragman İzle</span>
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
          }}
        >
          {/* Pop-up Modal Container - Daha büyük ve merkezde */}
          <div 
            className="relative bg-black rounded-lg shadow-2xl overflow-hidden w-full max-w-[1920px] aspect-video"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Kapat Butonu - Sağ üst köşede, modal içinde - Sadece desktop'ta görünür */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="hidden md:flex absolute top-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full items-center justify-center transition-all shadow-2xl border-2 border-white/40 hover:scale-110 z-50"
              aria-label="Kapat"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Paylaş Butonu - Kapat butonunun yanında (solunda) - Sadece desktop'ta görünür */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: title,
                    text: `${title} fragmanını izle`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link kopyalandı!');
                }
              }}
              className="hidden md:flex absolute top-4 right-20 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center transition-all shadow-2xl border-2 border-white/40 hover:scale-110 z-50"
              aria-label="Paylaş"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            
            {/* Video Container - Tam genişlik ve yükseklik */}
            <div className="relative w-full h-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1&playsinline=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

