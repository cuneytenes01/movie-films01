'use client'

import { useState } from 'react'

interface TrailerPlayerProps {
  trailerKey: string;
  title: string;
}

export default function TrailerPlayer({ trailerKey, title }: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trailerKey) return null;

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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] aspect-video bg-black overflow-hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
              aria-label="Kapat"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onClick={(e) => e.stopPropagation()}
              title={title}
            />
          </div>
        </div>
      )}
    </>
  );
}

