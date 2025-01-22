import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'http://fortify-c8os.onrender.com:8000/',
    BASE_URL_MD: 'http://fortify-c8os.onrender.com:8000',
  },
  reactStrictMode: true,
};

export default nextConfig;
