'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Zap, Crown, Gift, RefreshCw, ChevronLeft } from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';
import { PricingCard } from '@/components/ui/PricingCard';
import { useAppStore } from '@/store/useAppStore';

const SPIN_PRIZES = ['۵ گیگ حجم رایگان', '٪۱۰ تخفیف VIP', '۲ روز زمان اضافه', 'تلاش مجدد فردا'];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'spin'>('plans');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  // 🧠 خواندن متغیرها به صورت جداگانه (بهترین پرکتیس در Zustand برای React 19)
  const balance = useAppStore((state) => state.balance);
  const updateBalance = useAppStore((state) => state.updateBalance);
  const showNotification = useAppStore((state) => state.showNotification);

  const handleSpin = () => {
    if (isSpinning || spinResult) return;
    
    setIsSpinning(true);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('rigid');
    }

    setTimeout(() => {
      setIsSpinning(false);
      const randomPrize = SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)];
      setSpinResult(randomPrize);
      
      showNotification(`🎉 تبریک! شما ${randomPrize} برنده شدید.`, 'success');
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }, 3000);
  };

  // 💳 تابع خرید (کاملاً ایزوله شده و امن)
  const handleBuy = (price: number, planName: string) => {
    console.log(`تلاش برای خرید: ${planName} با قیمت ${price}`);
    
    if (balance >= price) {
      updateBalance(-price); // کسر موجودی
      showNotification(`✅ خرید ${planName} موفقیت‌آمیز بود.`, 'success');
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } else {
      showNotification(`❌ موجودی کافی نیست! (نیاز: ${price} USDT)`, 'error');
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };
  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2">
      
      {/* 🎭 هدر فروشگاه */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <ShoppingBag size={24} className="text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white">فروشگاه پرمیوم</h1>
            <span className="text-xs font-bold text-white/50">تضمین بهترین سرعت و پینگ</span>
          </div>
        </div>
        
        {/* 💰 نشان موجودی (زنده از Zustand) */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">موجودی شما</span>
          <span className={cn(
            "text-sm font-black font-outfit px-2 py-0.5 rounded-lg border transition-all duration-300",
            balance < 5 ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          )}>
            {balance.toFixed(2)} <span className="text-[10px] opacity-60">USDT</span>
          </span>
        </div>
      </motion.div>

      {/* 🎛️ تب‌های فروشگاه (Plans vs Lucky Spin) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl mx-1"
      >
        {['plans', 'spin'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'plans' | 'spin')}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 z-10",
              activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="store-tab-active"
                className="absolute inset-0 bg-white/10 rounded-xl shadow-inner border border-white/10 -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            {tab === 'plans' ? <Crown size={16} className={activeTab === 'plans' ? 'text-amber-400' : ''}/> : <Gift size={16} className={activeTab === 'spin' ? 'text-indigo-400' : ''}/>}
            {tab === 'plans' ? 'خرید اشتراک' : 'گردونه شانس'}
          </button>
        ))}
      </motion.div>

      {/* 🔄 محتوای داینامیک تب‌ها */}
      <div className="px-1 relative min-h-[500px] md:min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {activeTab === 'plans' && (
            <motion.div
              key="plans-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full flex flex-col gap-5"
            >
              {/* بنر تخفیف ویژه */}
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-between group cursor-pointer">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/20 rounded-full blur-xl -mr-5 -mt-5"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-bounce">
                    <Star size={20} className="fill-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-amber-400">تخفیف ۲۰٪ ویژه تریدرها</span>
                    <span className="text-xs font-bold text-amber-400/60">فقط تا پایان امشب</span>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              </div>

              {/* 🌟 گرید ریسپانسیو کارت‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
                <PricingCard
                  title="پلن استارتر"
                  price="3.99"
                  duration="۱ ماهه"
                  features={['حجم نامحدود واقعی', '۲ کاربر همزمان', 'سرورهای اروپا']}
                  delay={0}
                  onSelect={() => handleBuy(3.99, 'پلن استارتر')}
                />
                <PricingCard
                  title="پلن پرو (VIP)"
                  price="9.99"
                  duration="۳ ماهه"
                  features={['حجم نامحدود واقعی', '۵ کاربر همزمان', 'IP ثابت ترید', 'پشتیبانی VIP']}
                  isPopular={true}
                  delay={0.1}
                  onSelect={() => handleBuy(9.99, 'پلن پرو (VIP)')}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'spin' && (
            <motion.div
              key="spin-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-8 absolute inset-0 w-full pt-4"
            >
              <div className="text-center">
                <h2 className="text-xl font-black text-white mb-2">شانس روزانه‌ی شما</h2>
                <p className="text-xs font-medium text-white/50">هر ۲۴ ساعت یک‌بار گردونه را بچرخانید و جایزه بگیرید!</p>
              </div>

              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className={cn("absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-1000", isSpinning ? "scale-125 bg-indigo-500/30" : "scale-100")}></div>
                <div className={cn("absolute inset-4 rounded-full border-4 border-dashed border-indigo-500/30 transition-all duration-1000", isSpinning ? "animate-spin border-indigo-400" : "")} style={{ animationDuration: '3s' }}></div>
                
                <div className="relative z-10 w-48 h-48 rounded-full bg-[#0B0E14] border-2 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  {isSpinning ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw size={40} className="text-indigo-400" />
                    </motion.div>
                  ) : spinResult ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                      <Gift size={32} className="text-amber-400 fill-amber-400/20" />
                      <span className="text-sm font-black text-amber-400 leading-tight">{spinResult}</span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Zap size={32} className="text-indigo-400" />
                      <span className="text-xs font-bold text-white/50">آماده‌ی چرخیدن</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleSpin}
                disabled={isSpinning || spinResult !== null}
                className={cn(
                  "w-full max-w-[250px] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                  isSpinning 
                    ? "bg-white/10 text-white/40 cursor-not-allowed" 
                    : spinResult 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                )}
              >
                {isSpinning ? 'در حال چرخش...' : spinResult ? 'فردا دوباره امتحان کنید' : 'بچرخان و ببر!'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}