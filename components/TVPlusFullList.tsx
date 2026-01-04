'use client';

import Image from 'next/image';
import { TVPlusProgram, formatTime } from '@/lib/tvplus';

interface TVPlusFullListProps {
  items: TVPlusProgram[];
  title: string;
  description: string;
  icon: string;
  gradientColor: string;
}

export default function TVPlusFullList({ items, title, description, icon, gradientColor }: TVPlusFullListProps) {
  // Kanala göre grupla
  const groupedByChannel = items.reduce((acc, item) => {
    if (!acc[item.channelName]) {
      acc[item.channelName] = {
        channelLogo: item.channelLogo,
        programs: [],
      };
    }
    acc[item.channelName].programs.push(item);
    return acc;
  }, {} as Record<string, { channelLogo: string; programs: TVPlusProgram[] }>);

  // Kanal isimlerini alfabetik sırala
  const sortedChannels = Object.keys(groupedByChannel).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor}`}></div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              {icon} {title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              {description}
            </p>
            <div className="mt-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white font-bold">
                Toplam {items.length} içerik
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl">
            <p className="text-gray-400 text-lg">Bugün için içerik bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedChannels.map((channelName) => {
              const { channelLogo, programs } = groupedByChannel[channelName];
              
              // Saate göre sırala
              const sortedPrograms = [...programs].sort((a, b) => a.startTime - b.startTime);

              return (
                <div key={channelName} className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
                  {/* Channel Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                    {channelLogo && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={channelLogo}
                          alt={channelName}
                          fill
                          className="object-contain rounded-lg"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{channelName}</h2>
                      <p className="text-gray-400 text-sm">{sortedPrograms.length} program</p>
                    </div>
                  </div>

                  {/* Programs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all group"
                      >
                        {/* Image */}
                        {program.image && (
                          <div className="relative w-full h-40">
                            <Image
                              src={program.image}
                              alt={program.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            
                            {/* Time Badge */}
                            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-400">
                              {formatTime(program.startTime)}
                            </div>

                            {/* Broadcast Type */}
                            {program.broadcastType && (
                              <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white">
                                {program.broadcastType}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-3">
                          <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                            {program.name}
                          </h3>

                          {/* Description */}
                          {program.introduce && (
                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                              {program.introduce}
                            </p>
                          )}

                          {/* Time Range */}
                          <div className="text-gray-600 text-xs">
                            {formatTime(program.startTime)} - {formatTime(program.endTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

