// src/app/api/webhook/bot/route.ts
// Webhook endpoint برای ربات تلگرام — داخل Next.js
import { Bot, webhookCallback } from 'grammy';
import { NextRequest } from 'next/server';

// ساده‌ترین روش: forward به bot server
// یا اگه ربات رو داخل Next.js اجرا می‌کنی:
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;

const bot = new Bot(BOT_TOKEN);

// Import handler از bot/index.ts نیست — این یه نمونه مجزاست
// در production، bot/index.ts رو جداگانه deploy کن
export async function POST(req: NextRequest) {
  // بررسی Secret Token
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const handler = webhookCallback(bot, 'std/http');
    return handler(req);
  } catch (error) {
    console.error('[webhook] error:', error);
    return new Response('OK', { status: 200 }); // همیشه 200 برگردون
  }
}
