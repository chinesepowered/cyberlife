import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Other configurations you might have
  experimental: {
    // Add any experimental features you're using
  },
};

export default nextConfig;
