import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'

export const metadata: Metadata = {
  title: 'DİZİYOO - Film ve Dizi Kataloğu',
  description: 'TMDB API ile güçlendirilmiş film ve TV dizisi kataloğu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <nav className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto px-4 md:px-4 py-2.5 md:py-3">
              <div className="flex items-center justify-between gap-3 md:gap-4">
                {/* Hamburger Menu - Sadece mobilde görünür, logonun solunda */}
                <div className="md:hidden flex-shrink-0">
                  <MobileMenu />
                </div>
                <a href="/" className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-bold transition whitespace-nowrap group relative z-50 hover:opacity-90 flex-1 md:flex-initial justify-center md:justify-start">
                  <div className="relative z-50">
                    {/* Modern Premium DİZİYOO Logo - Clean & Professional Design */}
                    <svg className="w-10 h-10 md:w-20 md:h-20 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="logoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="50%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#f472b6" />
                        </linearGradient>
                        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="0" dy="2" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Outer ring with gradient */}
                      <circle cx="60" cy="60" r="55" fill="url(#logoGradient)" opacity="0.15"/>
                      {/* Main circle */}
                      <circle cx="60" cy="60" r="48" fill="url(#logoGradient)" filter="url(#logoShadow)"/>
                      {/* Inner highlight circle */}
                      <circle cx="60" cy="60" r="44" fill="url(#logoGradientLight)" opacity="0.4"/>
                      {/* Play button triangle - Modern and clean */}
                      <path d="M42 35 L42 85 L75 60 Z" fill="white" opacity="0.95"/>
                      {/* Inner play highlight for depth */}
                      <path d="M45 42 L45 78 L70 60 Z" fill="rgba(255,255,255,0.7)"/>
                      {/* Subtle border */}
                      <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="font-extrabold tracking-tight text-2xl md:text-4xl" style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em'
                  }}>
                    DİZİYOO
                  </span>
                </a>
                <div className="flex gap-3 md:gap-4 items-center text-sm md:text-base">
                  {/* Desktop Navigation - Sadece web'de görünür */}
                  <div className="hidden md:flex gap-3 md:gap-4 items-center">
                    <a href="/" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Ana Sayfa</a>
                    <a href="/movies" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Filmler</a>
                    <a href="/tv" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Diziler</a>
                    <a href="/yayin-akisi" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Yayın Akışı</a>
                  </div>
                  {/* Theme Toggle - Desktop'ta görünür */}
                  <div className="hidden md:block">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

