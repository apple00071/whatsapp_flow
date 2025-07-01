/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://34.45.239.220:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 