'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  WalletCards, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

// 🗂️ دیتای تستی برای تراکنش‌ها (بعداً از دیتابیس و API گرفته می‌شود)
const TRANSACTIONS = [
  { id: 1, type: 'deposit', title: 'شارژ حساب (TRC20)', amount: '+50.00', currency: 'USDT', date: 'امروز، ۱۴:۳۰', status: 'success' },
  { id: 2, type: 'purchase', title: 'خرید پلن پرو (۳ ماهه)', amount: '-9.99', currency: 'USDT', date: 'دیروز، ۱۰:۱۵', status: 'success' },
  { id: 3, type: 'deposit', title: 'شارژ حساب (TON)', amount: '+10.00', currency: 'USDT', date: '۱۲ فروردین', status: 'pending' },
];

export default function WalletPage() {
  
  // شبیه‌سازی لرزش هنگام کلیک روی دکمه‌های مالی
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2">
      
      {/* 🎭 هدر صفحه */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-2"
      >
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <WalletCards size={24} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">کیف پول من</h1>
      </motion.div>

      {/* 💳 کارت موجودی حساب (The Masterpiece Card) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
        className="relative overflow-hidden rounded-[2rem] p-7 bg-gradient-to-br from-indigo-600/90 to-purple-800/90 border border-white/20 shadow-[0_15px_40px_rgba(99,102,241,0.3)]"
      >
        {/* افکت‌های نوری داخل کارت */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-xl -ml-5 -mb-5"></div>

        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-white/70 text-sm font-medium">موجودی کل (Balance)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">
              14.50
            </span>
            <span className="text-lg font-bold text-white/80">USDT</span>
          </div>
          <span className="text-indigo-200 text-xs mt-2 bg-black/20 self-start px-2 py-1 rounded-md">
            ≈ 14.50 TRX (معادل حدودی)
          </span>
        </div>
      </motion.div>

      {/* 🕹️ دکمه‌های عملیاتی (Deposit / Withdraw) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-4 px-1"
      >
        {/* دکمه شارژ حساب */}
        <button 
          onClick={triggerHaptic}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group"
        >
          <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={24} />
          </div>
          <span className="text-sm font-bold text-white/90">شارژ حساب</span>
        </button>

        {/* دکمه برداشت/انتقال */}
        <button 
          onClick={triggerHaptic}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="p-3 rounded-full bg-white/10 text-white/70 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} />
          </div>
          <span className="text-sm font-bold text-white/90">انتقال / برداشت</span>
        </button>
      </motion.div>

      {/* 📜 لیست تاریخچه تراکنش‌ها */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-4 mt-4 px-1"
      >
        <div className="flex items-center gap-2 mb-1">
          <History size={18} className="text-white/50" />
          <h2 className="text-lg font-bold text-white/90">تراکنش‌های اخیر</h2>
        </div>

        <div className="flex flex-col gap-3">
          {TRANSACTIONS.map((tx, idx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }} // افکت ورود دانه‌دانه لیست
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors"
            >
              {/* آیکون و مشخصات */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {tx.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white/90">{tx.title}</span>
                  <span className="text-xs text-white/40 mt-0.5">{tx.date}</span>
                </div>
              </div>

              {/* مبلغ و وضعیت */}
              <div className="flex flex-col items-end">
                <span className={`text-sm font-black ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white/90'}`}>
                  {tx.amount}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  {tx.status === 'success' ? (
                    <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-[10px] text-emerald-500/80">موفق</span></>
                  ) : (
                    <><Clock size={12} className="text-amber-500" /><span className="text-[10px] text-amber-500/80">در حال تایید</span></>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}