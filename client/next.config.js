/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: false,
  experimental: {
    optimizeCss: false,
  },
  output: 'standalone',
  env: {
    // Add any environment variables that should be available at build time
    // These will be replaced with actual values from .env file
  },
};

module.exports = nextConfig;
