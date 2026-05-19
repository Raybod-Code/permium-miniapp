// bot/index.ts
// ربات تلگرام — Webhook mode (production-ready)
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEB_APP_URL = process.env.WEB_APP_URL!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID!;

if (!BOT_TOKEN) throw new Error('❌ TELEGRAM_BOT_TOKEN پیدا نشد!');
if (!WEB_APP_URL) throw new Error('❌ WEB_APP_URL پیدا نشد!');

const prisma = new PrismaClient();

const bot = new Bot(BOT_TOKEN);

// ─── /start Command ──────────────────────────────────────────
bot.command('start', async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  try {
    // Upsert کاربر
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        firstName: tgUser.first_name,
        username: tgUser.username || undefined,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name,
        username: tgUser.username || null,
        role: BigInt(tgUser.id).toString() === ADMIN_ID ? 'ADMIN' : 'USER',
      },
      include: {
        subscriptions: { where: { status: 'ACTIVE' } },
      },
    });

    const hasActive = user.subscriptions.length > 0;
    const keyboard = new InlineKeyboard().webApp(
      hasActive ? '🚀 مدیریت اشتراک' : '🛒 خرید اشتراک VPN',
      WEB_APP_URL,
    );

    const balanceStr = parseFloat(user.balance.toString()).toFixed(2);

    await ctx.reply(
      `🌟 *سلام ${escapeMarkdown(user.firstName || 'کاربر')} عزیز\!*

${hasActive
  ? '✅ اشتراک فعال داری\. از دکمه زیر مدیریت کن:'
  : '👋 به Premium VPN خوش اومدی\!\n\n🔐 *امن، سریع، بدون محدودیت*'
}

💰 موجودی: *${balanceStr} USDT*
👤 آیدی: \`${user.id}\``,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    console.error('❌ /start error:', error);
    await ctx.reply('⚠️ مشکلی پیش اومد. لطفاً دوباره تلاش کن.');
  }
});

// ─── /balance Command ────────────────────────────────────────
bot.command('balance', async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
      select: { balance: true, firstName: true },
    });

    if (!user) {
      await ctx.reply('ابتدا با /start ثبت‌نام کن.');
      return;
    }

    const balance = parseFloat(user.balance.toString()).toFixed(2);
    await ctx.reply(`💰 موجودی کیف پول: *${balance} USDT*`, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    console.error('❌ /balance error:', error);
  }
});

// ─── /admin Command (فقط ادمین) ──────────────────────────────
bot.command('admin', async (ctx) => {
  if (ctx.from?.id.toString() !== ADMIN_ID) {
    await ctx.reply('⛔ دسترسی ندارید.');
    return;
  }

  try {
    const [totalUsers, activeSubscriptions, pendingDeposits] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.depositRequest.count({ where: { status: 'PENDING' } }),
    ]);

    await ctx.reply(
      `📊 *پنل ادمین — آمار سریع*

👥 کاربران: *${totalUsers}*
✅ اشتراک فعال: *${activeSubscriptions}*
⏳ واریز در انتظار: *${pendingDeposits}*`,
      { parse_mode: 'Markdown' },
    );
  } catch (error) {
    console.error('❌ /admin error:', error);
  }
});

// ─── Error Handler ───────────────────────────────────────────
bot.catch((err) => {
  console.error('❌ Bot error:', err.message);
});

// ─── Cleanup ─────────────────────────────────────────────────
process.once('SIGINT', async () => { await prisma.$disconnect(); bot.stop(); });
process.once('SIGTERM', async () => { await prisma.$disconnect(); bot.stop(); });

// ─── Start Mode ──────────────────────────────────────────────
const USE_WEBHOOK = process.env.NODE_ENV === 'production';

if (USE_WEBHOOK) {
  // Webhook mode برای production
  const handleUpdate = webhookCallback(bot, 'http');
  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/bot-webhook') {
      // بررسی Secret Token
      const secret = req.headers['x-telegram-bot-api-secret-token'];
      if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
      }
      await handleUpdate(req, res);
    } else {
      res.writeHead(200);
      res.end('Bot is running!');
    }
  });

  const PORT = parseInt(process.env.BOT_PORT || '4000', 10);
  server.listen(PORT, () => {
    console.log(`🚀 Bot webhook server listening on port ${PORT}`);
  });
} else {
  // Polling mode برای development (بدون نیاز به پروکسی)
  console.log('🔄 Bot running in polling mode (development)...');
  bot.start({
    onStart: () => console.log('✅ Bot started successfully!'),
  });
}

// ─── Helper ──────────────────────────────────────────────────
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
