import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/paymaster/:path*',
        destination: process.env.PAYMASTER_URL
          ? `${process.env.PAYMASTER_URL}/:path*`
          : 'https://lazorkit-paymaster.onrender.com/:path*',
      },
    ]
  },
};

export default nextConfig;
