/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/whatsapp/status',
        destination: 'http://34.59.26.51:3002/api/whatsapp/status',
      },
      {
        source: '/api/whatsapp/qr',
        destination: 'http://34.59.26.51:3003/api/whatsapp/qr',
      },
      {
        source: '/api/:path*',
        destination: 'http://34.59.26.51:3002/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 