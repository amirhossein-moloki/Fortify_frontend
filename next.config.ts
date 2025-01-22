import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'https://fortify-c8os.onrender.com/',
    BASE_URL_MD: 'https://fortify-c8os.onrender.com/',
  },
  reactStrictMode: true,
};

export default nextConfig;
