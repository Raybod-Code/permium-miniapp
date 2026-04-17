import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { InAppNotification } from "@/components/ui/InAppNotification";

// ۱. تنظیم فونت فارسی (دوران) با رفع مشکل ضخامت و تداخل سیستم
const doran = localFont({
  src: [
    {
      path: "../../public/fonts/Doran-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Doran-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-doran",
  display: "swap",
  adjustFontFallback: false,
});

// ۲. تنظیم فونت انگلیسی (Outfit) برای اعداد و متون لاتین
const outfit = localFont({
  src: [
    {
      path: "../../public/fonts/Outfit-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Outfit-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
  adjustFontFallback: false,
});

// ۳. اطلاعات سئو و متادیتا
export const metadata: Metadata = {
  title: "Premium VPN | دنیای بدون مرز",
  description: "دسترسی آزاد، امن و پرسرعت به اینترنت با پروتکل‌های V2ray",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${doran.variable} ${outfit.variable}`}>
      <body
        className={`
          font-sans antialiased 
          /* 🌓 جادوی تم داینامیک: استفاده از متغیرهای تلگرام به جای رنگ‌های ثابت */
          bg-tg-bg text-tg-text 
          min-h-[100dvh] overflow-x-hidden
          selection:bg-primary/30 selection:text-primary
        `}
      >
        {/* 🔔 سیستم نوتیفیکیشن زنده (Zustand) در بالاترین لایه */}
        <InAppNotification />

        {/* 🌟 بدنه اصلی محتوای صفحات */}
        <main className="relative z-10 pb-24 px-4 pt-6">
          {children}
        </main>

        {/* 🔮 منوی شیشه‌ای ناوبری پایین */}
        <BottomNav />
        
        {/* ✨ افکت نئونی پس‌زمینه (سازگار با تم روشن و تاریک) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] opacity-50"></div>
        </div>

      </body>
    </html>
  );
}