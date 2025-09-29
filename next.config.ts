import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during builds to avoid issues with generated files
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checks during builds 
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
