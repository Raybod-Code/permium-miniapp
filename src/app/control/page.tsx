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
  ChevronLeft,
  WalletCards,
  LockKeyhole,
  History
} from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';
import Link from 'next/link';

export default function ControlPage() {
  const [user, setUser] = useState<{ id: number; firstName: string; username?: string } | null>(null);

  useEffect(() => {
    // 🔮 دریافت اطلاعات لایو از تلگرام
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser({ id: tgUser.id, firstName: tgUser.first_name, username: tgUser.username });
    } else {
      setUser({ id: 123456789, firstName: "کاربر VIP", username: "premium_user" });
    }
  }, []);

  const handleItemClick = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-4 pb-10 px-2">
      
      {/* 🎭 هدر و اطلاعات کاربر (Avatar Section) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center mt-2 relative"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <div className="flex items-center justify-center w-full h-full rounded-full bg-[#0B0E14] border-2 border-indigo-400/50">
              <UserCircle size={48} className="text-indigo-300/80" strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0B0E14]">
            <ShieldCheck size={20} className="text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">{user?.firstName || 'در حال بارگذاری...'}</h1>
        <p className="text-sm font-medium text-white/50 font-outfit tracking-wide">
          {user?.username ? `@${user.username}` : `ID: ${user?.id}`}
        </p>
      </motion.div>

      {/* 💳 کارت کیف پول سریع (Quick Wallet) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br from-indigo-600/90 to-purple-800/90 border border-white/20 shadow-[0_15px_40px_rgba(99,102,241,0.2)] mx-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-1">
            <span className="text-white/70 text-xs font-bold">موجودی کل (Balance)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-md font-outfit">14.50</span>
              <span className="text-sm font-bold text-white/80 font-outfit">USDT</span>
            </div>
          </div>
          <Link href="/wallet" onClick={handleItemClick}>
            <div className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer border border-white/10">
              <WalletCards size={24} className="text-white" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* ⚙️ بلوک اول تنظیمات: امنیت و لاگ‌ها (Security) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2 px-1"
      >
        <span className="text-xs font-bold text-white/40 ml-3 mb-1 uppercase tracking-wider">امنیت و اتصال</span>
        
        <div className="flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
          {/* آیتم ۱: لاگ اتصال */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform"><History size={20} /></div>
              <span className="text-sm font-bold text-white/80">تاریخچه اتصالات (Logs)</span>
            </div>
            <ChevronLeft size={16} className="text-white/30" />
          </button>

          {/* آیتم ۲: قفل برنامه */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform"><LockKeyhole size={20} /></div>
              <span className="text-sm font-bold text-white/80">قفل برنامه با اثرانگشت</span>
            </div>
            <div className="w-10 h-6 rounded-full bg-white/10 border border-white/10 relative flex items-center px-1 transition-colors">
              <div className="w-4 h-4 rounded-full bg-white/40 absolute left-1"></div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* ⚙️ بلوک دوم تنظیمات: عمومی (General) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-2 px-1"
      >
        <span className="text-xs font-bold text-white/40 ml-3 mb-1 uppercase tracking-wider">عمومی</span>
        
        <div className="flex flex-col rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
          {/* آیتم ۱: زبان */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.05] transition-colors group">
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
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"><Bell size={20} /></div>
              <span className="text-sm font-bold text-white/80">اطلاع‌رسانی اتمام حجم</span>
            </div>
            <div className="w-10 h-6 rounded-full bg-indigo-500 relative flex items-center px-1 transition-colors">
              <div className="w-4 h-4 rounded-full bg-white absolute right-1"></div>
            </div>
          </button>

          {/* آیتم ۳: پشتیبانی */}
          <button onClick={handleItemClick} className="flex items-center justify-between p-4 hover:bg-white/[0.05] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><HeadphonesIcon size={20} /></div>
              <span className="text-sm font-bold text-white/80">پشتیبانی آنلاین (24/7)</span>
            </div>
            <ChevronLeft size={16} className="text-white/30" />
          </button>
        </div>
      </motion.div>

      {/* 🚪 دکمه خروج */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 mb-4 px-1"
      >
        <button onClick={handleItemClick} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all">
          <LogOut size={20} />
          <span className="text-sm font-bold">خروج از حساب کاربری</span>
        </button>
      </motion.div>

    </div>
  );
}