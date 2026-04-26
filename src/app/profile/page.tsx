'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Copy, Zap, Globe2, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (user) {
      fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({ telegramId: user.id })
      }).then(res => res.json()).then(data => setUserData(data));
    }
  }, []);

  const copyConfig = (url: string) => {
    navigator.clipboard.writeText(url);
    const tg = (window as any).Telegram?.WebApp;
    tg?.showAlert("کانفیگ کپی شد! در برنامه V2Ray وارد کنید.");
    tg?.HapticFeedback.impactOccurred('medium');
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-28 text-white">
      {/* بخش کاربری */}
      <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <User size={32} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-black">{userData?.firstName || 'کاربر تایتان'}</h2>
          <span className="text-sm text-white/40">@{userData?.username || 'Guest'}</span>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase">وضعیت حساب</span>
          <span className={`text-sm font-bold ${userData?.isVip ? 'text-emerald-400' : 'text-amber-400'}`}>
            {userData?.isVip ? '💎 پرمیوم VIP' : 'رایگان'}
          </span>
        </div>
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase">دعوت شده‌ها</span>
          <span className="text-sm font-bold text-indigo-400">0 نفر</span>
        </div>
      </div>

      {/* 🚀 منوی دسترسی سریع (اضافه شده در اینجا) */}
      <div className="flex flex-col gap-3">
        <Link href="/servers" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <Globe2 className="text-indigo-400" size={20} /> 
            <span className="font-bold text-sm">رادار سرورها</span>
          </div>
        </Link>

        <Link href="/agent" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <Briefcase className="text-amber-400" size={20} /> 
            <span className="font-bold text-sm">پنل همکاران و نمایندگی</span>
          </div>
        </Link>
      </div>

      {/* لیست اشتراک‌ها */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Zap className="text-amber-400" size={20} /> سرویس‌های من
          </h3>
        </div>

        {userData?.subscriptions?.length > 0 ? (
          userData.subscriptions.map((sub: any) => (
            <div key={sub.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{sub.planName}</h4>
                  <span className="text-[10px] text-white/40 italic">انقضا: {new Date(sub.expiresAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <button 
                  onClick={() => copyConfig(sub.configUrl)}
                  className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/20 active:scale-95 transition-all"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div className="bg-black/30 p-2 rounded-lg text-[10px] font-mono text-white/30 truncate">
                {sub.configUrl}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-50">
            <p className="text-sm">هنوز هیچ اشتراکی خریداری نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}