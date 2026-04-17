// src/store/useAppStore.ts
import { create } from 'zustand';

// تعریف دقیق تایپ‌ها (TypeScript Best Practices)
interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppState {
  // 💰 اطلاعات مالی و کاربر
  balance: number;
  updateBalance: (amount: number) => void;
  
  // 🎨 تم گوشی (Light/Dark)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // 🔔 سیستم نوتیفیکیشن زنده (In-App Push)
  notification: NotificationType | null;
  showNotification: (message: string, type: NotificationType['type']) => void;
  clearNotification: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  balance: 14.50, // موجودی اولیه (بعدا از دیتابیس می‌آید)
  updateBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
  
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  notification: null,
  showNotification: (message, type) => {
    set({ notification: { message, type } });
    // نوتیفیکیشن بعد از ۳ ثانیه خودکار محو می‌شود
    setTimeout(() => set({ notification: null }), 3000);
  },
  clearNotification: () => set({ notification: null }),
}));