import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'http://localhost:8000/',
    BASE_URL_MD: 'http://localhost:8000', 
  },
  // سایر تنظیمات (در صورت نیاز)
  reactStrictMode: true, // این مورد اختیاری است و به‌طور پیش‌فرض فعال است
};

export default nextConfig;
