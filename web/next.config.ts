import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.node': {
        loaders: ['node-loader'],
        as: '*.js',
      },
    },
  },
  serverExternalPackages: ['better-sqlite3'],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
