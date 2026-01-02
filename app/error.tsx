'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Bir şeyler yanlış gitti!</h2>
        <p className="text-gray-300 mb-6">
          {error.message || 'Beklenmeyen bir hata oluştu.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}




