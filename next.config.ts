import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'https://your-production-url.com/',
    BASE_URL_MD: 'https://your-production-url.com/',
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
