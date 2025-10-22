import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Multi-domain configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>.*)\\.kevnbenestate\\.org',
            },
          ],
          destination: '/subdomains/:subdomain/:path*',
        },
        // Handle www redirect
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'www.kevnbenestate.org',
            },
          ],
          destination: '/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.kevnbenestate.org',
          },
        ],
        destination: 'https://flipstackk.kevnbenestate.org/:path*',
        permanent: true,
      },
      // Redirect HTTP to HTTPS in production
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://flipstackk.kevnbenestate.org/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'kevnbenestate.org', 
      '*.kevnbenestate.org',
      'flipstackk.kevnbenestate.org',
      'traeflipstackk4p7yk-eb5b81ev6-karfearsws-projects.vercel.app',
      'your-cdn-domain.com',
      ...(process.env.NODE_ENV === 'development' ? ['localhost'] : [])
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.kevnbenestate.org',
      },
      {
        protocol: 'https',
        hostname: 'kevnbenestate.org',
      },
      {
        protocol: 'https',
        hostname: 'flipstackk.kevnbenestate.org',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Disable webpack cache in production to prevent large cache files
    if (!dev) {
      config.cache = false;
    }
    
    // Tree shaking optimization
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Chunk splitting strategy for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          recharts: {
            test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }

    // Optimize bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      // Replace heavy libraries with lighter alternatives if needed
    };

    return config;
  },
  // Enable compression
  compress: true,
  // Enable static optimization
  output: 'standalone',
};

export default withBundleAnalyzer(nextConfig);
