// src/app/api/promo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, code } = await req.json();
    if (!code) return NextResponse.json({ error: 'کد الزامی است' }, { status: 400 });

    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (!promo) return NextResponse.json({ error: 'کد تخفیف معتبر نیست' }, { status: 404 });
    if (promo.expiresAt < new Date()) return NextResponse.json({ error: 'کد منقضی شده است' }, { status: 400 });
    if (promo.usedCount >= promo.usageLimit) return NextResponse.json({ error: 'ظرفیت کد تمام شده' }, { status: 400 });

    return NextResponse.json({
      valid: true,
      discount: promo.discount,
      message: `کد معتبر — ${promo.discount}٪ تخفیف اعمال شد`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

// ادمین: ساخت کد تخفیف
export async function PUT(req: NextRequest) {
  try {
    const { adminId, code, discount, usageLimit, expiryDays } = await req.json();
    const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(Number);

    if (!ADMIN_IDS.includes(Number(adminId))) {
      return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code || Math.random().toString(36).substring(2, 8).toUpperCase(),
        discount: parseInt(discount),
        usageLimit: parseInt(usageLimit) || 100,
        expiresAt: new Date(Date.now() + (expiryDays || 30) * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}