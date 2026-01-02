'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie, tv show, person......"
          className="w-full px-6 py-4 pl-14 pr-32 bg-white rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 text-lg shadow-lg"
        />
        <svg
          className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          type="submit"
          className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-teal-400 to-green-400 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>
    </form>
  )
}

