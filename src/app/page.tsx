'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, MonitorSmartphone, Smartphone, Laptop, XCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore'; // اتصال به نوتیفیکیشن‌ها

// 🔑 کانفیگ فرضی (بعداً از دیتابیس می‌آید)
const DUMMY_CONFIG = "vless://12345678-1234-1234-1234-123456789abc@1.2.3.4:443?type=tcp&security=tls&fp=chrome&sni=example.com#VIP-Server-1";

export default function HubPage() {
  const [isFixing, setIsFixing] = useState(false);
  const showNotification = useAppStore((state) => state.showNotification);

  // 🪄 تابع جادویی اتصال با یک کلیک (Deep Link)
  const handleQuickConnect = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let deepLink = '';

    // تشخیص سیستم‌عامل برای باز کردن کلاینت مناسب
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      deepLink = `v2box://install-sub?url=${encodeURIComponent(DUMMY_CONFIG)}`;
    } else if (userAgent.includes('android')) {
      deepLink = `v2rayng://install-sub?url=${encodeURIComponent(DUMMY_CONFIG)}`;
    } else {
      // برای ویندوز/لپ‌تاپ
      deepLink = DUMMY_CONFIG;
    }

    if (deepLink.startsWith('v2rayng') || deepLink.startsWith('v2box')) {
      // باز کردن اپلیکیشن روی موبایل
      window.location.href = deepLink;
      showNotification('در حال باز کردن نرم‌افزار...', 'success');
    } else {
      // اگر دسکتاپ بود، کپی می‌کنیم
      navigator.clipboard.writeText(deepLink);
      showNotification('کانفیگ کپی شد. در نرم‌افزار خود پیست کنید.', 'info');
    }

    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  // کپی ساده کانفیگ
  const handleCopyConfig = () => {
    navigator.clipboard.writeText(DUMMY_CONFIG);
    showNotification('لینک اتصال با موفقیت کپی شد!', 'success');
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  // تابع عیب‌یابی (Auto-Fix)
  const handleAutoFix = () => {
    if (isFixing) return;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('rigid');
    }
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      showNotification('عیب‌یابی موفق! پورت و IP جدید اختصاص یافت.', 'success');
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2">
      {/* ... هدر وضعیت زنده بدون تغییر ... */}
      
      {/* 📊 کارت مصرف و حجم (با دکمه‌های جدید) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex justify-between items-end mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full w-fit mb-2">V2ray Reality</span>
            <span className="text-4xl font-black text-white font-outfit">124.5 <span className="text-lg text-white/50">GB</span></span>
            <span className="text-sm font-medium text-white/40 mt-1">مصرف شده از نامحدود</span>
          </div>
          <div className="flex flex-col items-end text-right">
             <span className="text-3xl font-black text-indigo-400 font-outfit">45</span>
             <span className="text-xs font-medium text-white/40">روز مانده</span>
          </div>
        </div>

        {/* ⚡ دکمه‌های اتصال (Action Buttons) */}
        <div className="relative z-10 flex gap-3 mb-4">
          {/* دکمه اصلی: اتصال سریع */}
          <button 
            onClick={handleQuickConnect}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all font-bold text-sm"
          >
            <ExternalLink size={18} />
            اتصال با یک کلیک
          </button>
          
          {/* دکمه ثانویه: کپی لینک */}
          <button 
            onClick={handleCopyConfig}
            className="flex items-center justify-center px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white/80"
            title="کپی لینک"
          >
            <Copy size={18} />
          </button>
        </div>

        {/* 🛠️ دکمه جادویی عیب‌یابی (Auto-Fix) */}
        <button 
          onClick={handleAutoFix}
          disabled={isFixing}
          className="relative w-full overflow-hidden rounded-2xl p-4 bg-indigo-500/10 border border-indigo-500/30 group transition-all hover:bg-indigo-500/20"
        >
          {isFixing && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent skew-x-12"
            />
          )}
          <div className="relative z-10 flex items-center justify-center gap-2">
            <RefreshCw size={18} className={cn("text-indigo-400", isFixing && "animate-spin")} />
            <span className="text-sm font-bold text-indigo-300">
              {isFixing ? 'در حال تونل‌زنی و تغییر IP...' : 'سپر ضد فیلتر (عیب‌یابی خودکار)'}
            </span>
          </div>
        </button>
      </motion.div>

      {/* ... بقیه کد (لیست دستگاه‌های متصل) بدون تغییر ... */}

      {/* 📱 مدیر دستگاه‌های متصل (Smart Device Manager) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 px-1"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <MonitorSmartphone size={18} />
            <h2 className="text-base font-bold">دستگاه‌های متصل (۲/۵)</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* دستگاه ۱ */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-white/60">
                <Smartphone size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white/90">iPhone 13 Pro</span>
                <span className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> آنلاین الان
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-1 rounded-md">دستگاه فعلی</span>
          </div>

          {/* دستگاه ۲ */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-rose-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-white/60">
                <Laptop size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white/90">Windows 11 PC</span>
                <span className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> آخرین بازدید: ۲ ساعت پیش
                </span>
              </div>
            </div>
            {/* دکمه اخراج (Kick) */}
            <button 
              onClick={() => handleKickDevice('Windows 11 PC')}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
            >
              <XCircle size={18} />
            </button>
          </div>

        </div>
      </motion.div>

    </div>
  );
}