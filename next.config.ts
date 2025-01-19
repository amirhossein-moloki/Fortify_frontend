import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'https://fortify-c8os.onrender.com/:8000/',
    BASE_URL_MD: 'https://fortify-c8os.onrender.com/:8000', 
  },
  // سایر تنظیمات (در صورت نیاز)
  reactStrictMode: true, // این مورد اختیاری است و به‌طور پیش‌فرض فعال است
  
  // تنظیم مسیر خروجی برای build
  distDir: 'build', // مسیر خروجی را به 'build' تغییر می‌دهیم
};

export default nextConfig;
