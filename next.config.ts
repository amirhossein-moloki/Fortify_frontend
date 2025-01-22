import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'https://fortify-c8os.onrender.com:8000/',
    BASE_URL_MD: 'https://fortify-c8os.onrender.:8000/',
  },
  reactStrictMode: true,
};

export default nextConfig;
