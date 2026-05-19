// src/app/api/admin/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(Number);

function isAdmin(telegramId: string): boolean {
  return ADMIN_IDS.includes(Number(telegramId));
}

// GET — لیست تراکنش‌های pending
export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get('adminId');
  if (!adminId || !isAdmin(adminId)) {
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
  }

  const status = req.nextUrl.searchParams.get('status') || 'PENDING';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = 20;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { status },
      include: { user: { select: { telegramId: true, firstName: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where: { status } }),
  ]);

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      user: {
        ...t.user,
        telegramId: t.user.telegramId.toString(),
      },
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

// POST — تایید یا رد کردن تراکنش
export async function POST(req: NextRequest) {
  try {
    const { adminId, transactionId, action, note } = await req.json();

    if (!adminId || !isAdmin(adminId)) {
      return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) return NextResponse.json({ error: 'تراکنش یافت نشد' }, { status: 404 });
    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ error: 'این تراکنش قبلاً پردازش شده' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'COMPLETED', description: `${transaction.description} | تایید: ${note || ''}` },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `${transaction.amount} تتر به موجودی کاربر اضافه شد`,
      });
    }

    if (action === 'reject') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'REJECTED', description: `${transaction.description} | رد: ${note || 'بدون دلیل'}` },
      });

      return NextResponse.json({ success: true, message: 'تراکنش رد شد' });
    }

    return NextResponse.json({ error: 'action نامعتبر' }, { status: 400 });
  } catch (error) {
    console.error('Admin transaction error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}