// src/components/ui/InAppNotification.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '../layout/BottomNav';

export const InAppNotification = () => {
  // گوش دادن به تغییرات نوتیفیکیشن در کل اپلیکیشن
  const notification = useAppStore((state) => state.notification);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <XCircle size={20} className="text-rose-400" />,
    warning: <AlertTriangle size={20} className="text-amber-400" />,
    info: <Info size={20} className="text-blue-400" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 16, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
            bgColors[notification.type]
          )}>
            {icons[notification.type]}
            <span className="text-sm font-bold text-white tracking-wide">
              {notification.message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};