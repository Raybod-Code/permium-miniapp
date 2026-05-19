// src/lib/telegram-auth.ts
// اعتبارسنجی واقعی داده‌های Telegram WebApp
import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN!;

/**
 * اعتبارسنجی initData تلگرام — مطابق مستندات رسمی تلگرام
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string): boolean {
  if (!BOT_TOKEN || !initData) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    // مرتب‌سازی پارامترها
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // ساخت secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // محاسبه hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch {
    return false;
  }
}

/**
 * استخراج اطلاعات کاربر از initData
 */
export function parseTelegramInitData(initData: string): {
  telegramId: string;
  firstName: string;
  username?: string;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;

    const user = JSON.parse(decodeURIComponent(userStr));
    return {
      telegramId: String(user.id),
      firstName: user.first_name || 'کاربر',
      username: user.username,
    };
  } catch {
    return null;
  }
}

/**
 * middleware ساده برای APIها
 * در development mode اعتبارسنجی رو skip می‌کنه
 */
export function requireAuth(initData: string | null): {
  ok: boolean;
  telegramId?: string;
  error?: string;
} {
  // در development بدون auth
  if (process.env.NODE_ENV === 'development') {
    // اگر initData نداشتیم، از test user استفاده می‌کنیم
    if (!initData) {
      return { ok: true, telegramId: process.env.DEV_TEST_TELEGRAM_ID || '123456789' };
    }
  }

  if (!initData) {
    return { ok: false, error: 'احراز هویت الزامی است' };
  }

  if (!validateTelegramInitData(initData)) {
    return { ok: false, error: 'توکن نامعتبر است' };
  }

  const parsed = parseTelegramInitData(initData);
  if (!parsed) {
    return { ok: false, error: 'داده‌های کاربر ناقص است' };
  }

  return { ok: true, telegramId: parsed.telegramId };
}