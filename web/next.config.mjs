/** @type {import('next').NextConfig} */
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
}

export default nextConfig
