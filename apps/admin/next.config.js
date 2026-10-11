/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@enterprise/shared'],
  async rewrites() {
    const adminBackendUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/admin/:path*',
        destination: `${adminBackendUrl}/api/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
