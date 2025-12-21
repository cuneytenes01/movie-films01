/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
    // Cloudflare Pages için image optimization'ı kapat
    unoptimized: true,
  },
  // Cloudflare Pages için output ayarı
  output: 'standalone',
}

module.exports = nextConfig

