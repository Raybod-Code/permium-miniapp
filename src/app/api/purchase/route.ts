import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { telegramId, price, planName } = await request.json();

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    if (user.balance < price) return NextResponse.json({ error: 'موجودی کافی نیست! لطفا حساب خود را شارژ کنید.' }, { status: 400 });

    // کسر موجودی از کیف پول
    const updatedUser = await prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { balance: { decrement: price } }
    });

    // ثبت فاکتور خرید
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: price,
        type: 'PURCHASE',
        status: 'COMPLETED',
        description: `خرید ${planName}`
      }
    });

    // 🚀 جادوی شبیه‌ساز: تولید کانفیگ و ثبت در دیتابیس
    const randomId = crypto.randomUUID();
    const fakeConfig = `vless://${randomId}@46.226.161.214:443?type=tcp&security=xtls&flow=xtls-rprx-vision#Titan_${planName.replace(/\s+/g, '_')}`;

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planName: planName,
        configUrl: fakeConfig,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 روز اعتبار
      }
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: updatedUser.balance,
      config: fakeConfig
    });

  } catch (error) {
    console.error("Purchase Error:", error);
    return NextResponse.json({ error: 'خطای سرور در صدور کانفیگ' }, { status: 500 });
  }
}