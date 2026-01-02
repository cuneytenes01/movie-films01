import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'

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
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <a href="/" className="flex items-center gap-3 text-xl md:text-2xl font-bold text-primary-400 hover:text-primary-300 transition whitespace-nowrap group">
                  <div className="relative">
                    {/* Modern DİZİYOO Logo - Play Button with Gradient */}
                    <svg className="w-12 h-12 md:w-14 md:h-14 transition-all group-hover:scale-110" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      {/* Outer Circle with gradient */}
                      <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" className="group-hover:opacity-90 transition-opacity"/>
                      {/* Inner glow circle */}
                      <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                      {/* Play Triangle */}
                      <path d="M26 20 L26 44 L44 32 Z" fill="white" className="drop-shadow-lg"/>
                      {/* Decorative corner elements */}
                      <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
                      <rect x="51" y="10" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
                      <rect x="10" y="51" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
                      <rect x="51" y="51" width="3" height="3" rx="0.5" fill="white" opacity="0.7"/>
                    </svg>
                    {/* Animated pulse dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg ring-2 ring-white/50"></div>
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-extrabold tracking-tight drop-shadow-lg">
                    DİZİYOO
                  </span>
                </a>
                <div className="flex gap-3 md:gap-4 items-center text-sm md:text-base">
                  <a href="/" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Ana Sayfa</a>
                  <a href="/movies" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Filmler</a>
                  <a href="/tv" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Diziler</a>
                  <a href="/tv/on-the-air" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Yayında</a>
                  <a href="/yayin-akisi" className="text-gray-900 dark:text-white hover:text-primary-400 transition font-medium">Yayın Akışı</a>
                  <ThemeToggle />
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

