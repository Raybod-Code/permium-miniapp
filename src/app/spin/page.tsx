'use client';

import React, { useState } from 'react';
import { Gift, Trophy, RefreshCcw, AlertCircle, Sparkles } from 'lucide-react';

export default function SpinPage() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;

    // برای تست روی مرورگر کامپیوتر کامنت شده. در سرور واقعی از کامنت در بیاور
    // if (!userId) return tg?.showAlert("فقط در تلگرام قابل اجراست!"); 
    // const mockUserId = userId || 7047180987; // برای تست در کامپیوتر

    if(spinning) return;

    setSpinning(true);
    setError(null);
    setResult(null);
    tg?.HapticFeedback.impactOccurred('heavy');

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        body: JSON.stringify({ telegramId: userId || 123456789 }) // ایدی موقت برای تست
      });
      const data = await res.json();

      // انیمیشن چرخش (5 دور کامل + مقداری رندوم برای ایستادن)
      const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
      setRotation(newRotation);

      setTimeout(() => {
        setSpinning(false);
        if (data.success) {
          setResult(data);
          if (data.prize.type !== 'NONE') {
            tg?.HapticFeedback.notificationOccurred('success');
          } else {
            tg?.HapticFeedback.notificationOccurred('warning');
          }
        } else {
          setError(data.error);
          tg?.HapticFeedback.notificationOccurred('error');
        }
      }, 3000); // 3 ثانیه زمان چرخش هیجان‌انگیز

    } catch (err) {
      setSpinning(false);
      setError("اختلال در شبکه. دوباره تلاش کنید.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#050505] gap-8 p-6 pb-28 text-white font-doran overflow-hidden relative">
      {/* افکت‌های نوری پس‌زمینه */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center mt-8">
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-4 inline-block">Daily Reward</span>
        <h1 className="text-3xl font-black mb-2 flex items-center justify-center gap-2">
          گردونه پاداش تایتان
        </h1>
        <p className="text-white/50 text-xs">هر ۲۴ ساعت، پاداش وفاداری خود را دریافت کنید</p>
      </div>

      {/* گرافیک فوق‌لاکچری گردونه */}
      <div className="relative w-72 h-72 flex items-center justify-center mt-4">
        {/* نشانگر طلایی بالا */}
        <div className="absolute -top-4 z-30 flex flex-col items-center">
           <div className="w-8 h-8 bg-amber-400 rotate-45 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-4 border-[#050505]" />
        </div>

        {/* دایره چرخنده */}
        <div 
          className="absolute inset-0 rounded-full border-[12px] border-[#111] shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden transition-transform duration-[3000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: 'conic-gradient(from 0deg, #1e1b4b 0deg 60deg, #0f172a 60deg 120deg, #1e1b4b 120deg 180deg, #0f172a 180deg 240deg, #1e1b4b 240deg 300deg, #0f172a 300deg 360deg)'
          }}
        >
          {/* خطوط جداکننده گردونه */}
          <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 59deg, rgba(255,255,255,0.05) 59deg 60deg)' }} />
        </div>
        
        {/* دکمه SPIN وسط */}
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className="relative z-20 w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-[#050505] flex flex-col items-center justify-center font-black text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
        >
          {spinning ? <RefreshCcw className="animate-spin text-slate-900/50" /> : <Sparkles className="text-slate-900" size={28} />}
        </button>
      </div>

      {/* نمایش نتیجه */}
      <div className="w-full max-w-sm mt-8 z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-400 text-sm font-bold backdrop-blur-md">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 border backdrop-blur-md transition-all duration-500 ${result.prize.type === 'NONE' ? 'bg-white/5 border-white/10' : 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30'}`}>
            {result.prize.type === 'NONE' ? (
              <AlertCircle className="text-white/30" size={40} />
            ) : (
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Trophy className="text-amber-400" size={32} />
              </div>
            )}
            <div>
              <h3 className={`font-black text-xl mb-1 ${result.prize.type === 'NONE' ? 'text-white/60' : 'text-amber-400'}`}>{result.message}</h3>
              {result.prize.type !== 'NONE' && <p className="text-sm text-white/70">موجودی شما بلافاصله شارژ شد.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}