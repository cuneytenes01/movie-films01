'use client'

import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Body scroll'u engelle/kaldır
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Button - Sadece mobilde görünür */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
        aria-label="Menü"
        aria-expanded={isOpen}
      >
        <span className={`w-5 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`w-5 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
        <span className={`w-5 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      >
        <div
          className={`absolute top-0 left-0 h-full w-1/2 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menü</h2>
                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                  aria-label="Kapat"
                >
                  <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col gap-1">
                  <a
                    href="/"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-semibold text-base"
                  >
                    Ana Sayfa
                  </a>
                  <a
                    href="/movies"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-semibold text-base"
                  >
                    Filmler
                  </a>
                  <a
                    href="/tv"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-semibold text-base"
                  >
                    Diziler
                  </a>
                  <a
                    href="/tv/on-the-air"
                    onClick={closeMenu}
                    className="px-3 py-2.5 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all font-semibold text-base"
                  >
                    Yayında
                  </a>
                </div>
              </nav>

              {/* Theme Toggle in Menu */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white font-semibold text-base">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

