// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VpnPlan } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تبدیل تاریخ میلادی به فارسی
 */
export function toPersianDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * تبدیل عدد به فارسی با جداکننده هزار
 */
export function toPersianNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * محاسبه روزهای مانده به انقضا
 */
export function daysUntilExpiry(expiresAt: string): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * تبدیل bytes به GB
 */
export function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
}

/**
 * محاسبه درصد مصرف
 */
export function usagePercent(used: number, limit: number | null): number {
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * کوتاه کردن کانفیگ برای نمایش
 */
export function truncateConfig(config: string, maxLen = 40): string {
  if (config.length <= maxLen) return config;
  return config.substring(0, maxLen) + '...';
}

/**
 * تولید کد معرف تصادفی (در صورت نیاز)
 */
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * پلن‌های VPN — آماده برای اتصال به X-UI
 */
export const VPN_PLANS: VpnPlan[] = [
  {
    id: 'basic',
    name: 'برنزی',
    price: 2.5,
    duration: 30,
    dataLimit: 50,
    maxDevices: 1,
    color: '#CD7F32',
    features: ['50 گیگ حجم', '1 دستگاه', '30 روز', 'پروتکل VLESS'],
  },
  {
    id: 'silver',
    name: 'نقره‌ای',
    price: 4.5,
    duration: 30,
    dataLimit: 100,
    maxDevices: 2,
    badge: 'پرفروش',
    isPopular: true,
    color: '#6366F1',
    features: ['100 گیگ حجم', '2 دستگاه', '30 روز', 'Reality + VLESS', 'پشتیبانی آنلاین'],
  },
  {
    id: 'gold',
    name: 'طلایی',
    price: 7.0,
    duration: 30,
    dataLimit: null,
    maxDevices: 3,
    color: '#F59E0B',
    features: ['حجم نامحدود', '3 دستگاه', '30 روز', 'Reality + VLESS', 'اولویت پشتیبانی', 'IP ثابت'],
  },
  {
    id: 'platinum',
    name: 'پلاتینیوم',
    price: 12.0,
    duration: 30,
    dataLimit: null,
    maxDevices: 5,
    badge: 'VIP',
    color: '#8B5CF6',
    features: ['حجم نامحدود', '5 دستگاه', '30 روز', 'همه پروتکل‌ها', 'پشتیبانی ۲۴/۷', 'IP اختصاصی', 'سرور اختصاصی'],
  },
];