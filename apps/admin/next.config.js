/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/admin',
  transpilePackages: ['@enterprise/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const adminBackendUrl =
      process.env.DEFI_ORCHESTRATOR_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_ADMIN_API_URL ||
      'http://localhost:8000';
    return [
      {
        source: '/api/admin/:path*',
        destination: `${adminBackendUrl}/api/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
