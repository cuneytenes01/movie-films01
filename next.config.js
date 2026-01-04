/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'gbzeottvsc09.tvplus.com.tr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gbzeottvsc19.tvplus.com.tr',
        pathname: '/**',
      },
    ],
    // Cloudflare Pages için image optimization'ı kapat
    unoptimized: true,
  },
}

module.exports = nextConfig

