'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, PlusCircle, ArrowRightLeft, DollarSign, Crown } from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';

// 🗂️ دیتای تستی برای لیست مشتریان نماینده
const CLIENTS = [
  { id: 1, name: 'علی رضایی', status: 'active', expire: '۱۲ روز', plan: '۳ ماهه VIP' },
  { id: 2, name: 'سارا محمدی', status: 'expired', expire: 'منقضی شده', plan: '۱ ماهه' },
  { id: 3, name: 'M_Ahmadi_99', status: 'active', expire: '۴۵ روز', plan: '۶ ماهه VIP' },
];

export default function AgentDashboard() {
  
  // 📳 افکت ساخت کانفیگ جدید
  const handleCreateConfig = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }
    alert('مدال ساخت کانفیگ اختصاصی باز شد!');
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2 pb-10">
      
      {/* 🎭 هدر پنل نمایندگی */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Crown size={24} className="text-amber-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white">داشبورد نمایندگان</h1>
            <span className="text-xs font-bold text-amber-400/80">سطح: نماینده برنزی (Bronze)</span>
          </div>
        </div>
      </motion.div>

      {/* 📊 آمار کلی (Overview Cards) */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-1 p-4 rounded-3xl bg-white/[0.03] border border-white/5"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Users size={16} />
            <span className="text-xs font-bold">مشتریان فعال</span>
          </div>
          <span className="text-3xl font-black text-white font-outfit">124</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp size={10} /> +۱۲ نسبت به ماه قبل
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-1 p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20"
        >
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <DollarSign size={16} />
            <span className="text-xs font-bold">سود خالص شما</span>
          </div>
          <span className="text-3xl font-black text-amber-400 font-outfit">850<span className="text-sm">.5</span></span>
          <span className="text-[10px] text-amber-400/60 mt-1 font-outfit">USDT (ماه جاری)</span>
        </motion.div>
      </div>

      {/* 📈 نمودار درآمد بصری (Visual Chart Placeholder) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-[2rem] p-5 bg-white/[0.02] border border-white/5 mx-1"
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-bold text-white/70">روند فروش (۷ روز گذشته)</span>
          <span className="text-xs font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">۱۴ تا ۲۱ فروردین</span>
        </div>

        {/* شبیه‌سازی یک نمودار میله‌ای لوکس */}
        <div className="flex items-end justify-between h-24 gap-2 px-2 mt-4">
          {[30, 45, 25, 60, 80, 55, 95].map((height, i) => (
            <div key={i} className="relative flex flex-col items-center justify-end w-full group">
              {/* Tooltip در حالت هاور */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-1 rounded text-[10px] font-bold text-white">
                {height} فروش
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring" }}
                className={cn(
                  "w-full max-w-[12px] rounded-t-full transition-all duration-300",
                  i === 6 ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "bg-white/10 group-hover:bg-white/20"
                )}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* 🚀 دکمه‌های عملیاتی نماینده */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 px-1"
      >
        <button 
          onClick={handleCreateConfig}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all group"
        >
          <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black">ساخت کانفیگ جدید</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group text-white/70">
          <ArrowRightLeft size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">خرید عمده</span>
        </button>
      </motion.div>

      {/* 👥 لیست مشتریان نماینده */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 px-1 mt-2"
      >
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-sm font-bold text-white/90">مشتریان اخیر شما</span>
          <button className="text-xs font-bold text-amber-400 hover:text-amber-300">مشاهده همه</button>
        </div>

        {CLIENTS.map((client, idx) => (
          <div 
            key={client.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold font-outfit">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{client.name}</span>
                <span className="text-[10px] text-white/40 font-medium">{client.plan}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={cn(
                "text-xs font-black",
                client.status === 'active' ? "text-emerald-400" : "text-rose-400"
              )}>
                {client.expire}
              </span>
              <span className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">
                {client.status === 'active' ? 'فعال' : 'نیاز به تمدید'}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  );
}