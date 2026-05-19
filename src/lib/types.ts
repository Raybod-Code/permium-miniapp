// src/lib/types.ts
// تمام TypeScript types پروژه در یک فایل

export type UserRole = 'USER' | 'AGENT' | 'ADMIN';
export type TransactionType = 'PURCHASE' | 'DEPOSIT' | 'AGENT_UPGRADE' | 'GIFT' | 'REFERRAL_BONUS';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface AppUser {
  id: number;
  telegramId: string;
  firstName: string | null;
  username: string | null;
  balance: number;
  role: UserRole;
  referralCode: string;
  referredBy: string | null;
  agentDiscount: number;
  lastSpinDate: string | null;
  createdAt: string;
  isVip: boolean;
  subscriptions: AppSubscription[];
  transactions?: AppTransaction[];
}

export interface AppSubscription {
  id: number;
  userId: number;
  planName: string;
  configUrl: string;
  subLink: string | null;
  status: SubscriptionStatus;
  dataLimit: number | null;
  dataUsed: number;
  expiresAt: string;
  createdAt: string;
  // داده‌های live از پنل (اختیاری)
  upload?: number;
  download?: number;
  isOnline?: boolean;
  connectedDevices?: number;
}

export interface AppTransaction {
  id: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  createdAt: string;
}

export interface VpnPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // روز
  dataLimit: number | null; // گیگابایت، null = نامحدود
  maxDevices: number;
  badge?: string;
  isPopular?: boolean;
  color: string;
  features: string[];
}

export interface SpinPrize {
  id: number;
  name: string;
  type: 'NONE' | 'USDT' | 'DISCOUNT' | 'DAYS';
  value: number;
  probability: number; // 0-100
  color: string;
  emoji: string;
}

export interface AgentStats {
  totalSales: number;
  totalCommission: number;
  activeReferrals: number;
  thisMonthSales: number;
  discountPercent: number;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingDeposits: number;
  todayNewUsers: number;
  todayRevenue: number;
}

// X-UI / 3x-UI Panel types
export interface XUIInbound {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  clientStats: XUIClientStat[];
}

export interface XUIClientStat {
  id: number;
  inboundId: number;
  enable: boolean;
  email: string;
  up: number;
  down: number;
  expiryTime: number;
  total: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification type برای Zustand store
export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}