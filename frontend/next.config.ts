/** @type {import('next').NextConfig} */
const nextConfig = {  experimental: {
    optimizePackageImports: ['lucide-react'],
    // メモリ使用量最適化
    // optimizeCss: true, // disabled due to critters dependency issues
    esmExternals: true,
    // TypeScript設定の最適化
    typedRoutes: false,
  },
  transpilePackages: ['@mochiport/shared'],
  typescript: {
    ignoreBuildErrors: false,
  },  eslint: {
    ignoreDuringBuilds: false,
  },
  // 開発時のメモリ使用量を制御
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    if (dev) {
      // 開発時のメモリ使用量を制御
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/dist/**',
          '**/.turbo/**'
        ]
      };
      
      // メモリ使用量の制限
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
