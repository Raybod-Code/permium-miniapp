import { create } from 'zustand';

interface AppState {
  user: any | null;
  balance: number;
  isLoading: boolean;
  fetchUser: (telegramId: string) => Promise<void>;
  setBalance: (newBalance: number) => void;
  updateUserSubscriptions: (newSub: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  balance: 0,
  isLoading: false,
  
  // دریافت اطلاعات کاربر فقط یک بار و ذخیره در کل اپلیکیشن
  fetchUser: async (telegramId) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        body: JSON.stringify({ telegramId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data, balance: data.balance || 0, isLoading: false });
      }
    } catch (error) {
      console.error("Store Error:", error);
      set({ isLoading: false });
    }
  },

  setBalance: (balance) => set({ balance }),
  
  updateUserSubscriptions: (newSub) => 
    set((state) => ({
      user: {
        ...state.user,
        subscriptions: [...(state.user?.subscriptions || []), newSub]
      }
    })),
}));