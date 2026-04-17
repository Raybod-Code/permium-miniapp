import { Bot, InlineKeyboard } from 'grammy';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3'; // 👈 دوباره موتور را خودمان صدا می‌زنیم
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
// 🚀 راه‌حل نهایی و فورس‌ماژور برای SQLite
// ==========================================
// فایل دیتابیس را در همان پوشه اصلی پروژه (root) می‌سازیم تا آدرس‌دهی ۱۰۰٪ یکسان باشد
const absoluteDbPath = path.join(process.cwd(), 'dev.db');

// ما خودمان موتور دیتابیس را باز می‌کنیم، چون آداپتور بلد نیست آدرس‌ها را درست بخواند!
const sqlite = new Database(absoluteDbPath);

// دیتابیسِ آماده را به آداپتور می‌دهیم (بدون دادن URL)
const adapter = new PrismaBetterSqlite3(sqlite);
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

// ... ادامه کدهای bot.command ...

// ... ادامه کدهای bot.command ...

// ... در اینجا کدهای bot.command('start', ...) قرار می‌گیرند ...
// ... ادامه کدهای bot.command ...
// ... ادامه کدهای bot.command ...
// ... (ادامه کدهای bot.command('start', ...) بدون هیچ تغییری)

// ... ادامه کدها (bot.command و غیره دقیقاً مثل قبل) ...
// ... ادامه کدهای شما (bot.command و غیره)

// ==========================================
// 🟢 موتور پردازش دستور /start (ثبت‌نام خودکار)
// ==========================================
bot.command("start", async (ctx) => {
  const tgUser = ctx.from;
  if (!tgUser) return;

  const loadingMsg = await ctx.reply("⏳ در حال بررسی اطلاعات حساب شما...");

  try {
    // 🔍 جستجو در دیتابیس لوکال
    let dbUser = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
    });

    // ✨ ثبت‌نام کاربر جدید
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          telegramId: BigInt(tgUser.id),
          firstName: tgUser.first_name,
          username: tgUser.username || null,
          balance: 0.0,
          role: "USER",
        },
      });
      console.log(`👤 کاربر جدید ثبت شد: ${tgUser.first_name} (${tgUser.id})`);
    }

    // 📱 ساخت دکمه شیشه‌ای (مینی‌اپلیکیشن)
    const keyboard = new InlineKeyboard().webApp(
      "🚀 ورود به پلتفرم VIP",
      WEB_APP_URL,
    );

    const welcomeMessage = `
🌟 **سلام ${dbUser.firstName} عزیز، به Premium VPN خوش آمدی!**

آیدی سیستم شما: \`${dbUser.id.slice(-6).toUpperCase()}\`
موجودی فعلی: **${dbUser.balance} USDT**

اینجا نسل جدیدی از اینترنت آزاد است. 
امنیت، سرعت و پینگ پایین (مخصوص ترید و گیم) را با ما تجربه کن.

👇 **برای خرید اشتراک، دریافت کانفیگ و مدیریت حساب، روی دکمه زیر کلیک کن:**
    `;

    // ویرایش پیام بارگذاری
    await ctx.api.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      welcomeMessage,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    console.error("❌ خطای دیتابیس در دستور start:", error);
    await ctx.reply("⚠️ متأسفانه در ارتباط با پایگاه داده مشکلی پیش آمد.");
  }
});

// ==========================================
// 🛡️ مدیریت خطاها و روشن کردن سرور
// ==========================================
bot.catch((err) => {
  console.error(`❌ خطای داخلی ربات:`, err.message);
});

// بستن امن دیتابیس موقع خاموش شدن
process.once("SIGINT", () => {
  prisma.$disconnect();
  bot.stop();
});
process.once("SIGTERM", () => {
  prisma.$disconnect();
  bot.stop();
});

console.log("🚀 موتور ربات تلگرام و Prisma (نسخه ۷) با موفقیت روشن شد...");
bot.start();
