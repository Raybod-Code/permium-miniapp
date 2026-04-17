import { Bot, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { SocksProxyAgent } from 'socks-proxy-agent';
import * as dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.vercel.app';

if (!BOT_TOKEN) throw new Error('❌ توکن ربات پیدا نشد!');
if (!DATABASE_URL) throw new Error('❌ DATABASE_URL در .env پیدا نشد!');

// ==========================================
// 🚀 اتصال به Prisma Postgres (Accelerate)
// ==========================================
const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL,
}).$extends(withAccelerate());

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
// 🟢 دستور /start
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
🌟 *سلام ${dbUser.firstName} عزیز\!*

آیدی سیستم شما: \`${dbUser.id.slice(-6).toUpperCase()}\`
موجودی فعلی: *${dbUser.balance} USDT*

امنیت\u060c سرعت و پینگ پایین را با ما تجربه کن\.

👇 *برای خرید اشتراک روی دکمه زیر کلیک کن:*
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

bot.catch((err) => {
  console.error('❌ خطای داخلی ربات:', err.message);
});

process.once('SIGINT', () => { prisma.$disconnect(); bot.stop(); });
process.once('SIGTERM', () => { prisma.$disconnect(); bot.stop(); });

console.log('🚀 ربات تلگرام با Prisma Accelerate با موفقیت روشن شد...');
bot.start();
