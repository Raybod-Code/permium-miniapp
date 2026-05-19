// src/app/api/spin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SpinPrize } from '@/lib/types';

export const SPIN_PRIZES: SpinPrize[] = [
  { id: 1, name: 'پوچ',            type: 'NONE',     value: 0,   probability: 40, color: '#374151', emoji: '😔' },
  { id: 2, name: '۵۰۰ تومان',      type: 'USDT',     value: 0.01, probability: 25, color: '#059669', emoji: '💰' },
  { id: 3, name: 'پوچ',            type: 'NONE',     value: 0,   probability: 15, color: '#374151', emoji: '😔' },
  { id: 4, name: '۱ تتر هدیه',     type: 'USDT',     value: 1.0, probability: 10, color: '#6366F1', emoji: '🎁' },
  { id: 5, name: 'تخفیف ۱۰٪',     type: 'DISCOUNT', value: 10,  probability: 7,  color: '#D97706', emoji: '🏷️' },
  { id: 6, name: '۳ روز رایگان',   type: 'DAYS',     value: 3,   probability: 2,  color: '#7C3AED', emoji: '⚡' },
  { id: 7, name: '۵ تتر VIP',      type: 'USDT',     value: 5.0, probability: 1,  color: '#F59E0B', emoji: '👑' },
];

function spinWheel(): SpinPrize {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const prize of SPIN_PRIZES) {
    cumulative += prize.probability;
    if (rand <= cumulative) return prize;
  }
  return SPIN_PRIZES[0];
}

export async function GET() {
  return NextResponse.json({ prizes: SPIN_PRIZES });
}

export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();
    if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    // چک ۲۴ ساعت
    if (user.lastSpinDate) {
      const hoursSince = (Date.now() - user.lastSpinDate.getTime()) / 3600000;
      if (hoursSince < 24) {
        const remainingHours = Math.ceil(24 - hoursSince);
        const remainingMins = Math.ceil((24 - hoursSince) * 60) % 60;
        return NextResponse.json({
          error: `${remainingHours} ساعت و ${remainingMins} دقیقه تا چرخش بعدی`,
          nextSpinAt: new Date(user.lastSpinDate.getTime() + 24 * 3600000).toISOString(),
        }, { status: 429 });
      }
    }

    const prize = spinWheel();
    const updates: any = { lastSpinDate: new Date() };

    if (prize.type === 'USDT') {
      updates.balance = { increment: prize.value };
    }

    await prisma.user.update({ where: { id: user.id }, data: updates });

    if (prize.type !== 'NONE' && prize.type !== 'DISCOUNT') {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: prize.type === 'USDT' ? prize.value : 0,
          type: 'GIFT',
          status: 'COMPLETED',
          description: `جایزه گردونه: ${prize.name}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      prize,
      prizeIndex: SPIN_PRIZES.findIndex((p) => p.id === prize.id),
      message: prize.type === 'NONE'
        ? 'فردا دوباره امتحان کن!'
        : `تبریک 🎉 ${prize.name} برنده شدی!`,
    });
  } catch (error) {
    console.error('Spin error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}