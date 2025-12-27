import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure environment variables are available in Server Actions
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8888',
  },
};

export default nextConfig;
