import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <p className="text-gray-300 text-xl mb-6">
          Sayfa bulunamadı
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-semibold"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}




