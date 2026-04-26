import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'آیدی تلگرام الزامی است' }, { status: 400 });
    }

    // جستجوی کاربر در دیتابیس به همراه اشتراک‌های فعالش
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // تبدیل BigInt به String برای جلوگیری از خطای JSON در مرورگر
    return NextResponse.json({
      ...user,
      telegramId: user.telegramId.toString(),
      referredBy: user.referredBy?.toString(),
      isVip: user.subscriptions.length > 0 // اگر اشتراک فعال داشت، VIP است
    });

  } catch (error) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}