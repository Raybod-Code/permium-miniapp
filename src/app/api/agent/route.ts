// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const AGENT_UPGRADE_COST = 10; // ۱۰ تتر برای ارتقاء به نماینده
const AGENT_COMMISSION_PERCENT = 15; // ۱۵٪ کمیسیون

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get('telegramId');
  if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
  if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
  if (user.role !== 'AGENT' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'شما نماینده نیستید' }, { status: 403 });
  }

  // آمار کامیسیون
  const referrals = await prisma.user.findMany({
    where: { referredBy: user.telegramId },
    include: {
      transactions: {
        where: { type: 'PURCHASE', status: 'COMPLETED' },
        select: { amount: true, createdAt: true },
      },
    },
  });

  const totalSales = referrals.reduce((sum, r) => {
    return sum + r.transactions.reduce((s, t) => s + t.amount, 0);
  }, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthSales = referrals.reduce((sum, r) => {
    return sum + r.transactions
      .filter((t) => t.createdAt >= thisMonth)
      .reduce((s, t) => s + t.amount, 0);
  }, 0);

  const totalCommission = totalSales * (AGENT_COMMISSION_PERCENT / 100);

  return NextResponse.json({
    agentCode: user.referralCode,
    discountPercent: user.agentDiscount || 15,
    commissionPercent: AGENT_COMMISSION_PERCENT,
    totalSales,
    totalCommission,
    thisMonthSales,
    activeReferrals: referrals.filter((r) => r.createdAt >= thisMonth).length,
    totalReferrals: referrals.length,
    balance: user.balance,
  });
}

// POST — درخواست ارتقاء به نماینده
export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();
    if (!telegramId) return NextResponse.json({ error: 'telegramId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    if (user.role === 'AGENT' || user.role === 'ADMIN') {
      return NextResponse.json({ error: 'شما قبلاً نماینده هستید' }, { status: 400 });
    }

    if (user.balance < AGENT_UPGRADE_COST) {
      return NextResponse.json({
        error: `برای ارتقاء به ${AGENT_UPGRADE_COST} تتر نیاز دارید`,
      }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: {
          role: 'AGENT',
          balance: { decrement: AGENT_UPGRADE_COST },
          agentDiscount: 15,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount: AGENT_UPGRADE_COST,
          type: 'AGENT_UPGRADE',
          status: 'COMPLETED',
          description: 'ارتقاء به حساب نمایندگی',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تبریک! شما به نماینده ارتقاء پیدا کردید.',
    });
  } catch (error) {
    console.error('Agent upgrade error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}