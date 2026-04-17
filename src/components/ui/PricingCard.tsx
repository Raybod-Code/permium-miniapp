'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/components/layout/BottomNav'; // استفاده از ابزار ترکیب کلاس‌ها که قبلاً ساختیم

interface PricingCardProps {
  title: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  delay?: number;
  onSelect: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  duration,
  features,
  isPopular = false,
  delay = 0,
  onSelect
}) => {
  return (
    <motion.div
      // انیمیشن ورود نرم از پایین به بالا
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      // انیمیشن فشرده شدن هنگام کلیک (حس کلیک واقعی)
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-6 cursor-pointer",
        "bg-white/5 backdrop-blur-xl border transition-all duration-500",
        isPopular 
          ? "border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]" 
          : "border-white/10 hover:border-white/20 hover:bg-white/10"
      )}
    >
      {/* 🔮 افکت گرادیانت روی کارت ویژه (فقط برای پلن‌های محبوب) */}
      {isPopular && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      )}

      {/* 🏷️ تگ "پیشنهاد ویژه" */}
      {isPopular && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1">
          <Zap size={14} className="text-indigo-400 fill-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">محبوب‌ترین</span>
        </div>
      )}

      {/* 💳 بخش قیمت و عنوان */}
      <div className="mb-6 mt-2">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            {price}
          </span>
          <span className="text-sm font-medium text-white/50">USDT / {duration}</span>
        </div>
      </div>

      {/* ✔️ لیست امکانات */}
      <ul className="space-y-3.5 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <CheckCircle2 size={18} className={isPopular ? "text-indigo-400" : "text-white/40"} />
            <span className="text-sm font-medium text-white/80">{feature}</span>
          </li>
        ))}
      </ul>

      {/* 🚀 دکمه اکشن (با افکت Glow در حالت Hover) */}
      <button
        className={cn(
          "w-full rounded-2xl py-3.5 font-bold transition-all duration-300",
          isPopular 
            ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
      >
        انتخاب و پرداخت
      </button>
    </motion.div>
  );
};