import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo) return NextResponse.json({ error: 'کد تخفیف معتبر نیست' }, { status: 404 });
    
    if (new Date() > promo.expiresAt) return NextResponse.json({ error: 'کد تخفیف منقضی شده است' }, { status: 400 });
    
    if (promo.usedCount >= promo.usageLimit) return NextResponse.json({ error: 'ظرفیت این کد تمام شده است' }, { status: 400 });

    return NextResponse.json({ success: true, discount: promo.discount });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}