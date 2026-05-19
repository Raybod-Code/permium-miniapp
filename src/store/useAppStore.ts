// src/store/useAppStore.ts
import { create } from 'zustand';
import type { AppUser, AppNotification } from '@/lib/types';

interface AppState {
  // کاربر
  user: AppUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // نوتیفیکیشن
  notifications: AppNotification[];

  // Actions
  fetchUser: (telegramId: string) => Promise<void>;
  setUser: (user: AppUser) => void;
  updateBalance: (newBalance: number) => void;

  // Notification actions
  showNotification: (message: string, type?: AppNotification['type'], duration?: number) => void;
  dismissNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  notifications: [],

  fetchUser: async (telegramId: string) => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      });

      if (res.ok) {
        const user: AppUser = await res.json();
        set({ user, isLoading: false, isInitialized: true });
      } else {
        // کاربر جدید — ثبت اتوماتیک
        const regRes = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId }),
        });
        if (regRes.ok) {
          const newUser: AppUser = await regRes.json();
          set({ user: newUser, isLoading: false, isInitialized: true });
        }
      }
    } catch (error) {
      console.error('fetchUser error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user }),

  updateBalance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null,
    })),

  showNotification: (message, type = 'info', duration = 3500) => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type, duration }],
    }));
    setTimeout(() => {
      get().dismissNotification(id);
    }, duration);
  },

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));