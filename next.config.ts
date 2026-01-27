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
};

export default nextConfig;
