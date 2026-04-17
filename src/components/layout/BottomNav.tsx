'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe2, ShoppingBag, Briefcase, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🗂️ معماری جدید منوها برای سوپر-اپ
const NAV_ITEMS = [
  { name: 'هاب', icon: Activity, path: '/' },
  { name: 'سرورها', icon: Globe2, path: '/servers' },
  { name: 'فروشگاه', icon: ShoppingBag, path: '/store' },
  { name: 'نمایندگی', icon: Briefcase, path: '/agent' },
  { name: 'کنترل', icon: SlidersHorizontal, path: '/control' },
];

export const BottomNav = () => {
  const pathname = usePathname() || '/';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-5 pt-2 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto flex items-center justify-between rounded-3xl bg-[#0B0E14]/80 border border-white/10 px-2 py-2 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-2xl transition-colors z-10 group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <Icon
                size={22}
                className={cn(
                  'relative z-20 mb-1 transition-all duration-300',
                  isActive 
                    ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' 
                    : 'text-white/40 group-hover:text-white/60'
                )}
              />
              <span
                className={cn(
                  'relative z-20 text-[10px] font-bold transition-all duration-300',
                  isActive ? 'text-indigo-300' : 'text-white/40 group-hover:text-white/60'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};