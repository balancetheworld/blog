const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
    serverExternalPackages: ["sql.js"],
    // Docker 部署使用 standalone 模式，减小镜像体积
    output: 'standalone',

    // API 代理配置 - 将 /api 和 /uploads 路径代理到后端服务器
    async rewrites() {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ]
    },
  }

  export default nextConfig
