/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['www.arweave.net', 'arweave.net'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|bin|hdr|obj|mtl)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media',
          outputPath: 'static/media',
          name: '[hash].[ext]',
        },
      },
    });
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  experimental: {
    largePageDataBytes: 800 * 1000,
    isrMemoryCacheSize: 50 * 1024 * 1024,
    staticPageGenerationTimeout: 120,
  },
};

module.exports = nextConfig; 