// src/store/useAppStore.ts
// Zustand Global Store — نسخه کامل
import { create } from 'zustand';
import type { SerializedUser } from '@/lib/actions/user.action';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface AppStore {
  // 👤 User State
  user: SerializedUser | null;
  isLoading: boolean;
  setUser: (user: SerializedUser | null) => void;
  setLoading: (loading: boolean) => void;

  // 🔔 Notification System
  notifications: Notification[];
  showNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;

  // 🎡 Spin State
  isSpinning: boolean;
  setSpinning: (spinning: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // User
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Notifications
  notifications: [],
  showNotification: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    // خودکار بعد از ۳.۵ ثانیه حذف شه
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 3500);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Spin
  isSpinning: false,
  setSpinning: (spinning) => set({ isSpinning: spinning }),
}));
