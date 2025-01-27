/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middleware: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  reactStrictMode: false,
};

module.exports = nextConfig;
