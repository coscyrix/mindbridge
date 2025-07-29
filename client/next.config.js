/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: false,
  experimental: {
    optimizeCss: false,
  },
  // Disable image optimization in Docker to avoid permission issues
  images: {
    unoptimized: true,
  },
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
