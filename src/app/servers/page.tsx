'use client';

import React from 'react';
import { Activity, Globe2, Wifi, Server, CheckCircle2 } from 'lucide-react';

export default function ServersPage() {
  const servers = [
    { id: 1, country: 'فنلاند (Helsinki)', flag: '🇫🇮', ping: '85ms', load: 32, status: 'عالی', ip: '46.226.***.***' },
    { id: 2, country: 'آلمان (Falkenstein)', flag: '🇩🇪', ping: '92ms', load: 45, status: 'عالی', ip: '135.181.***.***' },
    { id: 3, country: 'هلند (Amsterdam)', flag: '🇳🇱', ping: '110ms', load: 78, status: 'شلوغ', ip: '95.217.***.***' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 pb-28 text-white">
      {/* هدر رادار */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-black p-6 rounded-[2.5rem] border border-indigo-500/30 flex items-center gap-4 relative overflow-hidden">
        <div className="p-4 bg-indigo-500/20 rounded-2xl relative z-10 backdrop-blur-md">
          <Activity className="text-indigo-400" size={32} />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black font-doran">رادار سرورها</h1>
          <p className="text-sm text-white/50">وضعیت زنده شبکه تایتان</p>
        </div>
        <Globe2 className="absolute top-[-20px] left-[-20px] w-32 h-32 text-indigo-500/10 -rotate-12" />
      </div>

      {/* لیست سرورها */}
      <div className="flex flex-col gap-4">
        {servers.map((server) => (
          <div key={server.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-white/10">
            {/* نوار وضعیت بالای کارت */}
            <div className={`absolute top-0 left-0 w-full h-1 ${server.load < 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{server.flag}</span>
                <div>
                  <h3 className="font-bold font-doran">{server.country}</h3>
                  <span className="text-[10px] text-white/40 font-mono">{server.ip}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${server.load < 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {server.load < 50 ? <CheckCircle2 size={14} /> : <Activity size={14} />}
                {server.status}
              </div>
            </div>

            {/* آمار پینگ و لود */}
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <Wifi size={16} className="text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40">پینگ شبکه</span>
                  <span className="text-sm font-bold">{server.ping}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Server size={16} className={server.load < 50 ? "text-emerald-400" : "text-amber-400"} />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] text-white/40 flex justify-between">
                    <span>ظرفیت</span> <span>{server.load}%</span>
                  </span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-1">
                    <div className={`h-1.5 rounded-full ${server.load < 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${server.load}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}