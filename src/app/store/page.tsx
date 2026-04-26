'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Ticket, CheckCircle2, Zap } from 'lucide-react';
import { PricingCard } from '@/components/ui/PricingCard';

export default function StorePage() {
  const [balance, setBalance] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [purchasedConfig, setPurchasedConfig] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;
      if (user) {
        const res = await fetch('/api/user', { method: 'POST', body: JSON.stringify({ telegramId: user.id }) });
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    };
    fetchUserData();
  }, []);

  const applyPromo = async () => {
    if (!promoCode) return;
    const res = await fetch('/api/promo', { method: 'POST', body: JSON.stringify({ code: promoCode }) });
    const data = await res.json();
    if (data.success) {
      setDiscount(data.discount);
      (window as any).Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
    } else {
      (window as any).Telegram?.WebApp?.showAlert(data.error);
    }
  };

  const handleBuy = async (originalPrice: number, planName: string) => {
    const tg = (window as any).Telegram?.WebApp;
    const finalPrice = originalPrice * (1 - discount / 100);

    tg.showConfirm(`خرید ${planName} به مبلغ ${finalPrice.toFixed(2)} USDT؟`, async (confirmed: boolean) => {
      if (confirmed) {
        const res = await fetch('/api/purchase', {
          method: 'POST',
          body: JSON.stringify({ telegramId: tg.initDataUnsafe?.user?.id, price: finalPrice, planName })
        });
        const result = await res.json();
        if (result.success) {
          setBalance(result.newBalance);
          setPurchasedConfig(result.config);
          tg.HapticFeedback.notificationOccurred('success');
        } else {
          tg.showAlert(`❌ ${result.error}`);
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 text-white font-doran">
      <div className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2"><ShoppingBag className="text-indigo-400" /> <span className="font-bold">موجودی</span></div>
        <div className="text-xl font-black text-emerald-400">{balance.toFixed(2)} <span className="text-xs opacity-50 font-sans">USDT</span></div>
      </div>

      {/* بخش کد تخفیف */}
      {!purchasedConfig && (
        <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex gap-2">
          <input 
            type="text" placeholder="کد تخفیف داری؟" value={promoCode} 
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 text-sm outline-none focus:border-indigo-500"
          />
          <button onClick={applyPromo} className="bg-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-all">اعمال</button>
        </div>
      )}

      {purchasedConfig ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl text-center animate-in zoom-in duration-300">
           <CheckCircle2 className="text-emerald-400 mx-auto mb-3" size={48} />
           <h2 className="text-xl font-black mb-2 text-emerald-400">خرید با موفقیت انجام شد!</h2>
           <p className="text-xs text-white/60 mb-4 font-sans break-all bg-black/40 p-3 rounded-xl">{purchasedConfig}</p>
           <button onClick={() => setPurchasedConfig(null)} className="text-sm font-bold opacity-50 underline">بازگشت به فروشگاه</button>
        </div>
      ) : (
        <div className="grid gap-4">
          <PricingCard 
            title="پلن اقتصادی" price={(5 * (1 - discount / 100)).toFixed(2)} 
            duration="۱ ماهه" features={['۵۰ گیگابایت', 'لوکیشن آلمان']} 
            onSelect={() => handleBuy(5, "اقتصادی ۱ ماهه")} 
          />
          <PricingCard 
            title="پلن بی نهایت VIP" price={(12 * (1 - discount / 100)).toFixed(2)} isPopular
            duration="۳ ماهه" features={['نامحدود واقعی', 'تمام لوکیشن‌ها']} 
            onSelect={() => handleBuy(12, "VIP ۳ ماهه")} 
          />
        </div>
      )}
    </div>
  );
}