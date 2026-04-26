'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Users, ShieldCheck, ArrowLeftRight, TrendingUp, UserPlus, Server, Copy, CheckCircle2 } from 'lucide-react';

export default function AgentPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // فرم ساخت کانفیگ توسط نماینده
  const [customerName, setCustomerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('1 MONTH - 50GB');

  const fetchUser = async () => {
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser) {
      const res = await fetch('/api/user', { method: 'POST', body: JSON.stringify({ telegramId: tgUser.id }) });
      const data = await res.json();
      setUser(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, []);

  const handleUpgrade = async () => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.showConfirm("هزینه فعال‌سازی پنل نمایندگی ۵۰ تتر است. آیا تایید می‌کنید؟", async (confirmed: boolean) => {
      if (confirmed) {
        setActionLoading(true);
        const res = await fetch('/api/agent/upgrade', {
          method: 'POST',
          body: JSON.stringify({ telegramId: user.telegramId })
        });
        const result = await res.json();
        setActionLoading(false);
        
        if (result.success) {
          tg?.HapticFeedback.notificationOccurred('success');
          tg?.showAlert("🎉 تبریک! پنل نمایندگی شما فعال شد.");
          fetchUser(); // رفرش کردن صفحه برای نمایش پنل جدید
        } else {
          tg?.HapticFeedback.notificationOccurred('error');
          tg?.showAlert(`❌ ${result.error}`);
        }
      }
    });
  };

  const handleCreateConfig = () => {
    const tg = (window as any).Telegram?.WebApp;
    if(!customerName) return tg?.showAlert("لطفاً نام مشتری را وارد کنید");
    tg?.showAlert(`(این بخش در قدم بعدی به API متصل می‌شود) کانفیگ برای ${customerName} در حال ساخت...`);
  };

  if (loading) return <div className="p-10 text-center text-white/50 animate-pulse">در حال بررسی هویت...</div>;

  // ==========================================
  // حالت ۱: پنل تخصصی برای نماینده یا ادمین
  // ==========================================
  if (user?.role === 'AGENT' || user?.role === 'ADMIN') {
    return (
      <div className="flex flex-col gap-6 p-4 pb-28 text-white">
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              {user.role === 'ADMIN' ? 'پنل فرماندهی' : 'پنل نماینده ویژه'}
            </span>
            <h1 className="text-2xl font-black font-doran mt-4 mb-1">داشبورد فروش</h1>
            <p className="text-white/70 text-sm">موجودی اعتبار: <span className="font-bold text-white">{user.balance.toFixed(2)} USDT</span></p>
          </div>
          <ShieldCheck className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/10 -rotate-12" />
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col gap-5">
          <h2 className="text-lg font-black flex items-center gap-2"><UserPlus className="text-emerald-400" /> ساخت اکانت برای مشتری</h2>
          
          <input 
            type="text" 
            placeholder="نام مشتری (مثلاً Ali_Reza)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
          />
          
          <select 
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all text-white [&>option]:bg-gray-900"
          >
            <option value="1 MONTH - 50GB">اقتصادی ۱ ماهه - ۵۰ گیگ (با تخفیف: 3.5 USDT)</option>
            <option value="2 MONTH - 100GB">حرفه‌ای ۲ ماهه - ۱۰۰ گیگ (با تخفیف: 6.0 USDT)</option>
            <option value="UNLIMITED - 1 MONTH">نامحدود ۱ ماهه VIP (با تخفیف: 8.5 USDT)</option>
          </select>

          <button onClick={handleCreateConfig} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
            تولید لینک و کسر از اعتبار
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-1">
            <span className="text-[10px] text-white/40 uppercase">سود شما (تخفیف)</span>
            <span className="text-sm font-bold text-emerald-400">۳۰٪ برای هر اکانت</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-1">
            <span className="text-[10px] text-white/40 uppercase">اکانت‌های ساخته شده</span>
            <span className="text-sm font-bold text-indigo-400">0 عدد</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // حالت ۲: کاربر عادی (تبلیغ برای خرید نمایندگی)
  // ==========================================
  return (
    <div className="flex flex-col gap-6 p-4 pb-28 text-white">
      <div className="bg-gradient-to-tr from-amber-600 to-orange-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">Titan Partners</span>
          <h1 className="text-3xl font-black font-doran mt-3 mb-1">پنل نمایندگی</h1>
          <p className="text-white/70 text-sm">تبدیل به فروشنده عمده شوید</p>
        </div>
        <Briefcase className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/10 -rotate-12" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-emerald-500/20 rounded-2xl"><Server className="text-emerald-400" /></div>
          <h3 className="font-bold text-sm">۳۰٪ تخفیف دائم</h3>
          <p className="text-[10px] text-white/40">خرید با قیمت همکاری</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-blue-500/20 rounded-2xl"><Users className="text-blue-400" /></div>
          <h3 className="font-bold text-sm">داشبورد اختصاصی</h3>
          <p className="text-[10px] text-white/40">ساخت اکانت برای مشتری</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-amber-400" />
          <h2 className="text-lg font-black font-doran">شرایط ارتقا به همکار</h2>
        </div>
        <p className="text-xs text-white/60 leading-relaxed mb-4">
          با پرداخت <span className="font-bold text-emerald-400">۵۰ تتر</span> از موجودی کیف پول خود، پنل نمایندگی شما فوراً فعال شده و دائم‌العمر می‌توانید از تمام سرویس‌ها با ۳۰٪ تخفیف استفاده کنید.
        </p>
        
        <button 
          onClick={handleUpgrade}
          disabled={actionLoading}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-600/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {actionLoading ? 'در حال پردازش...' : <><ArrowLeftRight size={18} /> فعال‌سازی پنل همکار (50 USDT)</>}
        </button>
      </div>
    </div>
  );
}