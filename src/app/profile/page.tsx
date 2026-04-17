'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Globe, 
  HeadphonesIcon, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';

export default function ProfilePage() {
  // گرفتن اطلاعات کاربر از تلگرام به صورت زنده
  const [user, setUser] = useState<{ id: number; firstName: string; username?: string } | null>(null);

  useEffect(() => {
    // 🔮 اگر اپ در محیط تلگرام باز شود، اطلاعات واقعی را می‌گیرد
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser({
        id: tgUser.id,
        firstName: tgUser.first_name,
        username: tgUser.username
      });
    } else {
      // دیتای تستی برای زمانی که در مرورگر کامپیوتر هستیم
      setUser({ id: 123456789, firstName: "کاربر VIP", username: "premium_user" });
    }
  }, []);

  // شبیه‌سازی لرزش برای دکمه‌های تنظیمات
  const handleItemClick = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-4 px-2">
      
      {/* 🎭 هدر و اطلاعات کاربر (Avatar Section) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center mt-2 relative"
      >
        {/* آواتار درخشان */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <div className="flex items-center justify-center w-full h-full rounded-full bg-[#0B0E14] border-2 border-indigo-400/50">
              <UserCircle size={48} className="text-indigo-300/80" strokeWidth={1.5} />
            </div>
          </div>
          {/* بج تاییدیه VIP */}
          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0B0E14]">
            <ShieldCheck size={20} className="text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">
          {user?.firstName || 'در حال بارگذاری...'}
        </h1>
        <p className="text-sm font-medium text-white/50 font-outfit tracking-wide">
          {user?.username ? `@${user.username}` : `ID: ${user?.id}`}
        </p>
      </motion.div>

      {/* 📦 کارت وضعیت اشتراک فعلی (Subscription Status) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] p-6 bg-white/[0.03] border border-white/10"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-white/70">اشتراک فعلی شما</span>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">فعال</span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-black text-white">پلن پرو</span>
          <span className="text-sm font-medium text-white/50">(۳ ماهه)</span>
        </div>
        
        {/* Progress Bar حجم/زمان */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>۴۵ روز باقی‌مانده</span>
            <span>حجم نامحدود</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-1/2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>
        </div>
      </motion.div>

      {/* ⚙️ لیست تنظیمات و دسترسی‌ها (iOS Style Glass List) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <span className="text-xs font-bold text-white/40 ml-2 mb-1 uppercase tracking-wider">تنظیمات حساب</span>
        
        <div className="flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
          
          {/* آیتم ۱: زبان */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><Globe size={20} /></div>
              <span className="text-sm font-bold text-white/80">زبان برنامه (Language)</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <span className="text-xs font-medium">فارسی</span>
              <ChevronLeft size={16} />
            </div>
          </button>

          {/* آیتم ۲: اعلان‌ها */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"><Bell size={20} /></div>
              <span className="text-sm font-bold text-white/80">اطلاع‌رسانی اتمام حجم</span>
            </div>
            <div className="w-10 h-6 rounded-full bg-indigo-500 relative flex items-center px-1 transition-colors">
              <div className="w-4 h-4 rounded-full bg-white absolute right-1"></div>
            </div>
          </button>

          {/* آیتم ۳: پشتیبانی */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><HeadphonesIcon size={20} /></div>
              <span className="text-sm font-bold text-white/80">پشتیبانی آنلاین (24/7)</span>
            </div>
            <ChevronLeft size={16} className="text-white/40" />
          </button>

        </div>
      </motion.div>

      {/* 🚪 دکمه خروج/قطع اتصال (با رنگ هشدار ملایم) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 mb-6"
      >
        <button onClick={handleItemClick} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-bold">خروج از حساب کاربری</span>
        </button>
      </motion.div>

    </div>
  );
}