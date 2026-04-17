import { Bot, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { SocksProxyAgent } from 'socks-proxy-agent';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.vercel.app';

if (!BOT_TOKEN) {
  throw new Error('❌ خطای بحرانی: توکن ربات پیدا نشد!');
}

// ==========================================
// 🚀 اتصال تضمینی به دیتابیس SQLite
// ==========================================
// مسیر مطلق فایل دیتابیس را می‌سازیم
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

// موتور دیتابیس را مستقیماً با مسیر مطلق باز می‌کنیم
const sqliteDb = new BetterSqlite3(dbPath);

// آداپتور را با نمونه دیتابیس می‌سازیم
const adapter = new PrismaBetterSqlite3(sqliteDb);
const prisma = new PrismaClient({ adapter });

// ==========================================
// 🌐 تنظیم پراکسی و راه‌اندازی ربات
// ==========================================
const socksAgent = new SocksProxyAgent('socks5://127.0.0.1:10808');

const bot = new Bot(BOT_TOKEN, {
  client: {
    baseFetchConfig: {
      agent: socksAgent,
      compress: true,
    },
  },
});

// ==========================================
// 🟢 موتور پردازش دستور /start (ثبت‌نام خودکار)
// ==========================================
bot.command('start', async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  const loadingMsg = await ctx.reply('⏳ در حال بررسی اطلاعات حساب شما...');

  try {
    let dbUser = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          telegramId: BigInt(tgUser.id),
          firstName: tgUser.first_name,
          username: tgUser.username || null,
          balance: 0.0,
          role: 'USER',
        },
      });
      console.log(`👤 کاربر جدید ثبت شد: ${tgUser.first_name} (${tgUser.id})`);
    }

    const keyboard = new InlineKeyboard().webApp(
      '🚀 ورود به پلتفرم VIP',
      WEB_APP_URL,
    );

    const welcomeMessage = `
🌟 *سلام ${dbUser.firstName} عزیز، به Premium VPN خوش آمدی\!*

آیدی سیستم شما: \`${dbUser.id.slice(-6).toUpperCase()}\`
موجودی فعلی: *${dbUser.balance} USDT*

اینجا نسل جدیدی از اینترنت آزاد است\. 
امنیت، سرعت و پینگ پایین را با ما تجربه کن\.

👇 *برای خرید اشتراک و مدیریت حساب روی دکمه زیر کلیک کن:*
    `;

    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      welcomeMessage,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    console.error('❌ خطای دیتابیس در دستور start:', error);
    await ctx.reply('⚠️ متأسفانه در ارتباط با پایگاه داده مشکلی پیش آمد.');
  }
});

// ==========================================
// 🛡️ مدیریت خطاها و روشن کردن سرور
// ==========================================
bot.catch((err) => {
  console.error('❌ خطای داخلی ربات:', err.message);
});

process.once('SIGINT', () => { prisma.$disconnect(); bot.stop(); });
process.once('SIGTERM', () => { prisma.$disconnect(); bot.stop(); });

console.log('🚀 موتور ربات تلگرام و Prisma با موفقیت روشن شد...');
bot.start();
