import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_URL: 'http://localhost:8000/',  // URL پایه‌ی خود را اینجا وارد کنید
  },
  // سایر تنظیمات (در صورت نیاز)
  reactStrictMode: true, // این مورد اختیاری است و به‌طور پیش‌فرض فعال است
};

export default nextConfig;
