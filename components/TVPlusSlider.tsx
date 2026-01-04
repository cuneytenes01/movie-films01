'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TVPlusProgram, formatTime } from '@/lib/tvplus';

interface TVPlusSliderProps {
  items: TVPlusProgram[];
  viewAllLink: string;
  title: string;
}

export default function TVPlusSlider({ items, viewAllLink, title }: TVPlusSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-white/5 rounded-xl">
        <p className="text-gray-400">Bugün için içerik bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        <Link
          href={viewAllLink}
          className="text-primary-400 hover:text-primary-300 font-semibold text-sm md:text-base flex items-center gap-2 transition"
        >
          Tümünü Gör
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Slider Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          aria-label="Önceki"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Slider */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-64 bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group/card"
            >
              {/* Image */}
              {item.image && (
                <div className="relative w-full h-36">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Time Badge */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-400">
                    {formatTime(item.startTime)}
                  </div>

                  {/* Broadcast Type */}
                  {item.broadcastType && (
                    <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white">
                      {item.broadcastType}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-3">
                <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                  {item.name}
                </h3>

                {/* Channel */}
                <div className="flex items-center gap-2 mb-2">
                  {item.channelLogo && (
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={item.channelLogo}
                        alt={item.channelName}
                        fill
                        className="object-contain rounded"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="text-gray-400 text-xs font-medium truncate">
                    {item.channelName}
                  </span>
                </div>

                {/* Description */}
                {item.introduce && (
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {item.introduce}
                  </p>
                )}

                {/* Time Range */}
                <div className="text-gray-600 text-xs mt-2">
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          aria-label="Sonraki"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

