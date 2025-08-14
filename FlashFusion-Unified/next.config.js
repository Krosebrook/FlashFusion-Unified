/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://dev-chat-kylerosebrook.replit.app',
        permanent: false,
      },
      {
        source: '/(.*)',
        destination: 'https://dev-chat-kylerosebrook.replit.app/$1',
        permanent: false,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig