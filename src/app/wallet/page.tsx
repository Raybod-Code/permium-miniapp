'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Copy, Coins, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState('');
  const [loading, setLoading] = useState(false);

  // آدرس ولت تتر تو - اینجا آدرس واقعی خودت را بگذار
  const WALLET_ADDRESS = "TSc1YourRealTetherTRC20AddressHere";

  useEffect(() => {
    const fetchBalance = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;
      if (user) {
        const res = await fetch('/api/user', { method: 'POST', body: JSON.stringify({ telegramId: user.id }) });
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    };
    fetchBalance();
  }, []);

  const handleDeposit = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!amount || Number(amount) < 1) return tg?.showAlert("حداقل مبلغ واریز ۱ تتر است");
    if (!txid) return tg?.showAlert("لطفاً هش تراکنش (TXID) را وارد کنید");

    setLoading(true);
    const res = await fetch('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: tg?.initDataUnsafe?.user?.id,
        amount: amount,
        txid: txid,
        method: 'USDT (TRC20)'
      })
    });

    setLoading(false);
    if (res.ok) {
      tg?.showConfirm("درخواست شارژ با موفقیت ثبت شد. پس از تایید توسط شبکه و مدیریت (۱۰ الی ۳۰ دقیقه)، موجودی شما شارژ می‌شود.");
      setAmount('');
      setTxid('');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 text-white">
      {/* کارت موجودی لوکس */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-white/60 text-sm mb-1 font-bold">موجودی تایتان</span>
          <div className="flex items-center gap-2">
            <span className="text-5xl font-black">{balance.toFixed(2)}</span>
            <span className="text-xl opacity-50">USDT</span>
          </div>
        </div>
        <Coins className="absolute top-[-20px] left-[-20px] w-32 h-32 text-white/5 -rotate-12" />
      </div>

      {/* بخش واریز تتر */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col gap-5 backdrop-blur-md">
        <h2 className="text-lg font-black flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" /> شارژ مستقیم USDT
        </h2>
        
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
          <span className="text-[10px] text-white/40 block">آدرس ولت شما (شبکه TRC20)</span>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-mono text-indigo-300 break-all">{WALLET_ADDRESS}</span>
            <button onClick={() => {
              navigator.clipboard.writeText(WALLET_ADDRESS);
              (window as any).Telegram?.WebApp?.HapticFeedback.impactOccurred('medium');
            }} className="p-2 hover:bg-white/10 rounded-lg">
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <input 
            type="number" 
            placeholder="مبلغ واریز شده (مثلاً 15.5)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-center font-bold outline-none focus:border-indigo-500 transition-all"
          />
          <input 
            type="text" 
            placeholder="هش تراکنش یا TXID"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-center text-xs font-mono outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <button 
          onClick={handleDeposit}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          {loading ? 'در حال ثبت...' : 'ثبت نهایی واریز'}
        </button>

        <div className="flex gap-2 items-start bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
          <Info className="text-blue-400 shrink-0" size={16} />
          <p className="text-[10px] text-blue-200/70 leading-relaxed">
            لطفاً پس از انتقال تتر در ولت خود، هش تراکنش (TXID) را کپی کرده و اینجا قرار دهید. واریزی‌ها به صورت دستی توسط ادمین تایید می‌شوند.
          </p>
        </div>
      </div>
    </div>
  );
}