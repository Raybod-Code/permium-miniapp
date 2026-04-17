'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Gift, Copy, CheckCircle2, Users, Coins } from 'lucide-react';

export default function EarnPage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://t.me/PremiumVpnBot?start=ref_123456";

  // 🪄 متغیرهای متحرک برای افکت سه‌بعدی کارت (Mouse/Touch Tracking)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // تبدیل حرکت موس/لمس به زاویه چرخش (Tilt Effect)
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  // تابعی برای محاسبه موقعیت لمس/موس روی کارت
  const handleMouseMove = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as React.MouseEvent).clientY;
    
    // محاسبه فاصله از مرکز کارت
    x.set(clientX - rect.left - rect.width / 2);
    y.set(clientY - rect.top - rect.height / 2);
  };

  // برگشتن کارت به حالت صاف وقتی دست/موس برداشته می‌شود
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // کپی کردن لینک با افکت لرزش
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2">
      
      {/* 🎭 هدر صفحه */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center mt-2"
      >
        <div className="p-3 mb-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Gift size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">دعوت کن، جایزه بگیر!</h1>
        <p className="text-sm font-medium text-white/50 px-4">
          با دعوت هر دوست، <span className="text-indigo-400 font-bold">15%</span> از مبلغ خرید آن‌ها را مستقیماً تتر (USDT) دریافت کنید.
        </p>
      </motion.div>

      {/* 💳 کارت دعوت سه‌بعدی هولوگرافیک (The 3D Holographic Card) */}
      <div className="relative w-full max-w-[320px] mx-auto perspective-1000 mt-2 px-2">
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
          className="relative w-full aspect-[1.6/1] rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-purple-800 p-6 shadow-[0_20px_40px_rgba(99,102,241,0.3)] border border-white/20 cursor-grab active:cursor-grabbing overflow-hidden"
        >
          {/* ✨ افکت درخشش هولوگرافیک (Shine Effect) */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none mix-blend-overlay"
            animate={{
              backgroundPosition: ['200% -200%', '-200% 200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: '200% 200%' }}
          />

          <div className="relative z-10 flex flex-col justify-between h-full" style={{ transform: "translateZ(30px)" }}>
            <div className="flex justify-between items-start">
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                VIP Pass
              </span>
              <Gift size={24} className="text-white/80" />
            </div>
            
            <div>
              <p className="text-white/60 text-xs mb-1">کد دعوت اختصاصی شما</p>
              <p className="text-2xl font-black tracking-wider text-white drop-shadow-lg">
                REF-123456
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 🔗 بخش لینک دعوت و دکمه کپی */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-2 mt-2"
      >
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex-1 truncate px-3 py-2 text-sm text-white/70 font-medium font-outfit">
            {referralLink}
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
          >
            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </motion.div>

      {/* 📊 آمار عملکرد کاربر */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 px-2 mt-2"
      >
        {/* کارت آمار ۱ */}
        <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-white/50 mb-1">
            <Users size={16} />
            <span className="text-xs font-bold">دوستان دعوت شده</span>
          </div>
          <span className="text-2xl font-black text-white">12 <span className="text-sm font-medium text-white/40">نفر</span></span>
        </div>

        {/* کارت آمار ۲ */}
        <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Coins size={16} />
            <span className="text-xs font-bold">درآمد کل</span>
          </div>
          <span className="text-2xl font-black text-indigo-300">45.5 <span className="text-sm font-medium text-indigo-300/50">USDT</span></span>
        </div>
      </motion.div>

    </div>
  );
}