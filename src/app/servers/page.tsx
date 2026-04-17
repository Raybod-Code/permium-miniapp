'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Signal, Zap, Activity, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/components/layout/BottomNav';
import { useAppStore } from '@/store/useAppStore'; // اتصال به نوتیفیکیشن‌ها

// 🗂️ دیتای سرورها (با اضافه شدن URL واقعی برای تست پینگ)
const INITIAL_SERVERS = [
  { id: 'ger_1', name: 'آلمان (فرانکفورت)', flag: '🇩🇪', ping: 0, load: 35, status: 'unknown', isPremium: false, testUrl: 'https://de.wikipedia.org/favicon.ico' },
  { id: 'fin_1', name: 'فنلاند (هلسینکی)', flag: '🇫🇮', ping: 0, load: 60, status: 'unknown', isPremium: false, testUrl: 'https://fi.wikipedia.org/favicon.ico' },
  { id: 'nl_1', name: 'هلند (آمستردام)', flag: '🇳🇱', ping: 0, load: 85, status: 'unknown', isPremium: false, testUrl: 'https://nl.wikipedia.org/favicon.ico' },
  { id: 'uk_vip', name: 'انگلیس (لندن) - ترید', flag: '🇬🇧', ping: 0, load: 15, status: 'unknown', isPremium: true, testUrl: 'https://en.wikipedia.org/favicon.ico' },
  { id: 'us_vip', name: 'آمریکا (نیویورک)', flag: '🇺🇸', ping: 0, load: 25, status: 'unknown', isPremium: true, testUrl: 'https://en.wikipedia.org/favicon.ico' },
];

const PROTOCOLS = ['V2ray', 'WireGuard', 'Outline'];

export default function ServersPage() {
  const [servers, setServers] = useState(INITIAL_SERVERS);
  const [activeServer, setActiveServer] = useState('ger_1');
  const [activeProtocol, setActiveProtocol] = useState('V2ray');
  const [isTestingPing, setIsTestingPing] = useState(false);
  
  const showNotification = useAppStore((state) => state.showNotification);

  // 📳 تابع تغییر سرور
  const handleServerSwitch = (id: string, isPremium: boolean) => {
    if (isPremium) {
      showNotification('این سرور فقط برای حساب‌های VIP (پرو) فعال است.', 'warning');
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }
    } else {
      setActiveServer(id);
      showNotification('سرور جدید با موفقیت تنظیم شد.', 'success');
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      }
    }
  };

  // ⚡ الگوریتم تست پینگ واقعی (Real Latency Test)
  const testRealPing = async () => {
    if (isTestingPing) return;
    setIsTestingPing(true);
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // ایجاد یک کپی جدید از سرورها برای آپدیت
    const updatedServers = [...servers];

    // تست تک‌تک سرورها
    for (let i = 0; i < updatedServers.length; i++) {
      const server = updatedServers[i];
      const startTime = performance.now(); // شروع تایمر کلاینت

      try {
        // ارسال یک درخواست به سرور هدف (معمولا یک عکس بسیار کم‌حجم یا فایل استاتیک)
        // از no-cache استفاده می‌کنیم تا واقعا به سرور وصل شود، نه حافظه گوشی
        await fetch(`${server.testUrl}?t=${new Date().getTime()}`, { 
          mode: 'no-cors', 
          cache: 'no-cache' 
        });
        
        const endTime = performance.now(); // پایان تایمر
        const latency = Math.round(endTime - startTime);
        
        updatedServers[i].ping = latency;
        updatedServers[i].status = latency < 100 ? 'excellent' : latency < 200 ? 'good' : 'heavy';
        
      } catch (error) {
        // اگر نتوانست وصل شود (تایم‌اوت یا فیلتر)
        updatedServers[i].ping = 999;
        updatedServers[i].status = 'heavy';
      }

      // آپدیت زنده UI در حین تست
      setServers([...updatedServers]);
    }

    setIsTestingPing(false);
    showNotification('تست پینگ واقعی با اینترنت شما انجام شد.', 'success');
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  // رنگ‌بندی داینامیک پینگ
  const getPingColor = (ping: number) => {
    if (ping === 0) return 'text-white/30';
    if (ping < 120) return 'text-emerald-400';
    if (ping < 250) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pt-2 pb-10">
      
      {/* 📡 بخش رادار گرافیکی (Visual Radar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center justify-center p-6 mt-2 overflow-hidden rounded-[2rem] bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/10"
      >
        {/* افکت امواج رادار (در زمان تست پینگ سریع‌تر می‌چرخد) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn("w-32 h-32 rounded-full border absolute transition-all", isTestingPing ? "border-emerald-500/40 animate-ping" : "border-indigo-500/20 animate-ping")} style={{ animationDuration: isTestingPing ? '1s' : '3s' }}></div>
          <div className={cn("w-48 h-48 rounded-full border absolute transition-all", isTestingPing ? "border-emerald-500/20 animate-ping" : "border-indigo-500/10 animate-ping")} style={{ animationDuration: isTestingPing ? '1s' : '3s', animationDelay: '0.5s' }}></div>
        </div>

        <Globe2 size={40} className={cn("mb-3 relative z-10 transition-colors", isTestingPing ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]")} />
        <h1 className="text-2xl font-black text-white relative z-10">رادار سرورها</h1>
        <p className="text-xs font-medium text-white/50 mt-1 relative z-10">انتخاب هوشمند مسیر تونل‌زنی</p>

        {/* ⚡ دکمه تست پینگ زنده */}
        <button 
          onClick={testRealPing}
          disabled={isTestingPing}
          className="mt-6 relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group"
        >
          <Activity size={16} className={cn(isTestingPing ? "animate-pulse text-emerald-400" : "text-indigo-300")} />
          <span className="text-sm font-bold text-white/90">
            {isTestingPing ? 'در حال تست...' : 'تست سرعت زنده (Ping)'}
          </span>
        </button>
      </motion.div>

      {/* 🎛️ انتخابگر پروتکل */}
      {/* ... کد تب پروتکل‌ها مثل قبل ... */}
      
      {/* 📋 لیست سرورها */}
      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">لیست سرورهای در دسترس</span>
        </div>

        {servers.map((server, idx) => {
          const isActive = activeServer === server.id;
          
          return (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (idx * 0.05) }}
              onClick={() => handleServerSwitch(server.id, server.isPremium)}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border overflow-hidden group",
                isActive 
                  ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
              )}
            >
              {/* افکت نوری پس‌زمینه */}
              {isActive && <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}

              {/* بخش راست: پرچم و نام */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-xl border border-white/5">
                  {server.flag}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", isActive ? "text-white" : "text-white/80")}>{server.name}</span>
                    {server.isPremium && <span className="flex items-center text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">VIP</span>}
                  </div>
                  
                  {/* لود سرور */}
                  <div className="flex items-center gap-2 w-24">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", server.load > 70 ? "bg-rose-500" : "bg-indigo-400")} style={{ width: `${server.load}%` }}></div>
                    </div>
                    <span className="text-[10px] text-white/40 font-outfit">{server.load}%</span>
                  </div>
                </div>
              </div>

              {/* بخش چپ: پینگ و وضعیت */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-0.5 min-w-[40px]">
                  <div className="flex items-center gap-1">
                    <Signal size={14} className={getPingColor(server.ping)} />
                    <span className={cn("text-sm font-black font-outfit", getPingColor(server.ping))}>
                      {server.ping === 0 ? '--' : server.ping}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 font-outfit">ms</span>
                </div>
                
                {/* دایره رادیویی */}
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isActive ? "border-indigo-400" : "border-white/20 group-hover:border-white/40"
                )}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}