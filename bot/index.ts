import { Bot, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { SocksProxyAgent } from 'socks-proxy-agent';
import * as dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.vercel.app';

if (!BOT_TOKEN) throw new Error('❌ توکن ربات پیدا نشد!');
if (!process.env.DATABASE_URL) throw new Error('❌ DATABASE_URL در .env پیدا نشد!');

// Prisma خودکار DATABASE_URL را از .env می‌خوند
const prisma = new PrismaClient();

const socksAgent = new SocksProxyAgent('socks5://127.0.0.1:10808');

const bot = new Bot(BOT_TOKEN, {
  client: {
    baseFetchConfig: {
      agent: socksAgent,
      compress: true,
    },
  },
});

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
      console.log(`👤 کاربر جدید: ${tgUser.first_name} (${tgUser.id})`);
    }

    const keyboard = new InlineKeyboard().webApp(
      '🚀 ورود به پلتفرم VIP',
      WEB_APP_URL,
    );

    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      `🌟 *سلام ${dbUser.firstName} عزیز\!*

آیدی: \`${dbUser.id.slice(-6).toUpperCase()}\`
موجودی: *${dbUser.balance} USDT*

👇 *برای خرید اشتراک روی دکمه زیر کلیک کن:*`,
      { parse_mode: 'MarkdownV2', reply_markup: keyboard },
    );
  } catch (error) {
    console.error('❌ خطا:', error);
    await ctx.reply('⚠️ متأسفانه در ارتباط با پایگاه داده مشکلی پیش آمد.');
  }
});

bot.catch((err) => console.error('❌ خطای ربات:', err.message));

process.once('SIGINT', () => { prisma.$disconnect(); bot.stop(); });
process.once('SIGTERM', () => { prisma.$disconnect(); bot.stop(); });

console.log('🚀 ربات با موفقیت روشن شد...');
bot.start();
