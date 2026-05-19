// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/user?telegramId=xxx
export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get('telegramId');
  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        subscriptions: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    return NextResponse.json(serializeUser(user));
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// POST /api/user — ثبت‌نام / لاگین (upsert)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, firstName, username, referralCode } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 });
    }

    // upsert: اگه هست آپدیت کن، اگه نیست بساز
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {
        firstName: firstName || undefined,
        username: username || undefined,
      },
      create: {
        telegramId: BigInt(telegramId),
        firstName: firstName || 'کاربر',
        username: username || null,
        referredBy: referralCode ? await findReferrerId(referralCode) : null,
      },
      include: {
        subscriptions: { where: { status: 'ACTIVE' } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    // پاداش دعوت (اگه از طریق لینک اومده)
    if (user.referredBy && user.createdAt.getTime() > Date.now() - 5000) {
      await giveReferralBonus(user.referredBy);
    }

    return NextResponse.json(serializeUser(user));
  } catch (error) {
    console.error('POST /api/user error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

async function findReferrerId(code: string): Promise<bigint | null> {
  try {
    const referrer = await prisma.user.findFirst({ where: { referralCode: code } });
    return referrer?.telegramId || null;
  } catch {
    return null;
  }
}

async function giveReferralBonus(referrerTelegramId: bigint) {
  try {
    const BONUS = 0.5; // ۰.۵ تتر پاداش معرفی
    const referrer = await prisma.user.findUnique({ where: { telegramId: referrerTelegramId } });
    if (!referrer) return;

    await prisma.$transaction([
      prisma.user.update({
        where: { telegramId: referrerTelegramId },
        data: { balance: { increment: BONUS } },
      }),
      prisma.transaction.create({
        data: {
          userId: referrer.id,
          amount: BONUS,
          type: 'REFERRAL_BONUS',
          status: 'COMPLETED',
          description: 'پاداش معرفی کاربر جدید',
        },
      }),
    ]);
  } catch (err) {
    console.error('Referral bonus error:', err);
  }
}

// BigInt serializer
function serializeUser(user: any) {
  return {
    ...user,
    telegramId: user.telegramId.toString(),
    referredBy: user.referredBy?.toString() ?? null,
    isVip: (user.subscriptions?.length || 0) > 0,
    subscriptions: user.subscriptions?.map((s: any) => ({
      ...s,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })) || [],
    transactions: user.transactions?.map((t: any) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })) || [],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastSpinDate: user.lastSpinDate?.toISOString() ?? null,
  };
}