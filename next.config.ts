import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cloudflare Pages用最適化
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    // キャッシュを無効化してファイルサイズを削減
    config.cache = false;
    
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'baktuzfzixpnkftajmfz.supabase.co',
      },
    ],
  },
};

export default nextConfig;
