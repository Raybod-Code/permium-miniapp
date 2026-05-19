// src/lib/telegram-auth.ts
// اعتبارسنجی واقعی داده‌های Telegram WebApp — نسخه امن
import crypto from 'crypto';

/**
 * اعتبارسنجی initData تلگرام
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string): boolean {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN || !initData) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    // بررسی زمان (max 24 ساعت)
    const authDate = params.get('auth_date');
    if (authDate) {
      const diff = Math.floor(Date.now() / 1000) - parseInt(authDate, 10);
      if (diff > 86400) return false; // بیشتر از 24 ساعت
    }

    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

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
export function parseTelegramInitData(
  initData: string,
): {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
} | null {
  // در development بدون initData، از DEV_TEST_TELEGRAM_ID استفاده کن
  if (process.env.NODE_ENV === 'development' && !initData) {
    return {
      telegramId: process.env.DEV_TEST_TELEGRAM_ID || '123456789',
      firstName: 'توسعه‌دهنده',
      username: 'dev_user',
    };
  }

  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;

    const user = JSON.parse(decodeURIComponent(userStr));
    return {
      telegramId: String(user.id),
      firstName: user.first_name || 'کاربر',
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      languageCode: user.language_code,
    };
  } catch {
    return null;
  }
}
