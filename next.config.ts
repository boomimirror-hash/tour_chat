import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    // 한글 경로 파닉 버그 우회 — 절대경로로 root 고정
    root: path.resolve(__dirname),
  },
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
