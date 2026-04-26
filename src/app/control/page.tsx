'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Check, X, User as UserIcon, Activity } from 'lucide-react';

export default function AdminControlPage() {
  const [pendingTx, setPendingTx] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const MY_ID = 7047180987; // 🛡️ آیدی تو

    if (tg?.initDataUnsafe?.user?.id === MY_ID) {
      setIsAdmin(true);
      fetchPending();
    } else {
      window.location.href = '/'; // اخراج غیر-ادمین
    }
  }, []);

  const fetchPending = async () => {
    const res = await fetch('/api/admin/transactions');
    const data = await res.json();
    setPendingTx(data);
  };

  const handleAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      body: JSON.stringify({ transactionId: id, action })
    });
    if (res.ok) fetchPending();
  };

  if (!isAdmin) return null;

  return (
    <div className="p-6 text-white pb-28 font-doran">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-500" />
          <h1 className="text-2xl font-black">پنل فرماندهی تایتان</h1>
        </div>
        <div className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded-full border border-emerald-500/30">ONLINE</div>
      </div>

      <h2 className="text-sm opacity-50 mb-4 flex items-center gap-2"><Activity size={14}/> درخواست‌های واریز تتر (PENDING)</h2>

      <div className="space-y-4">
        {pendingTx.length === 0 ? (
          <div className="text-center py-20 opacity-30 border-2 border-dashed border-white/5 rounded-3xl">درخواستی نیست</div>
        ) : (
          pendingTx.map((tx: any) => (
            <div key={tx.id} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col gap-4 backdrop-blur-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400"><UserIcon size={20}/></div>
                  <div className="flex flex-col">
                    <span className="font-bold">{tx.user?.firstName}</span>
                    <span className="text-[10px] opacity-40">@{tx.user?.username || 'no_user'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400">{tx.amount}</span>
                  <span className="text-[10px] opacity-50 block">USDT</span>
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-[10px] font-mono break-all text-white/50">
                TXID: {tx.description}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAction(tx.id, 'APPROVE')} className="bg-emerald-600 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20">
                  <Check size={18}/> تایید و شارژ
                </button>
                <button onClick={() => handleAction(tx.id, 'REJECT')} className="bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <X size={18}/> رد درخواست
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}