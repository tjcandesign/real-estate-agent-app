/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

module.exports = nextConfig;
