import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'https', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'http', hostname: 'gocamping.or.kr' },
      { protocol: 'https', hostname: 'gocamping.or.kr' },
    ],
  },
}

export default nextConfig
