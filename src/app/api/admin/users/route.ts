// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(Number);

export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get('adminId');
  if (!adminId || !ADMIN_IDS.includes(Number(adminId))) {
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
  }

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = req.nextUrl.searchParams.get('search') || '';
  const role = req.nextUrl.searchParams.get('role') || undefined;
  const limit = 20;

  const where: any = {};
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { firstName: { contains: search } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        subscriptions: { where: { status: 'ACTIVE' }, select: { planName: true, expiresAt: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      telegramId: u.telegramId.toString(),
      referredBy: u.referredBy?.toString() ?? null,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastSpinDate: u.lastSpinDate?.toISOString() ?? null,
      subscriptions: u.subscriptions.map((s) => ({
        ...s,
        expiresAt: s.expiresAt.toISOString(),
      })),
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

// POST — تغییر role یا موجودی کاربر
export async function POST(req: NextRequest) {
  try {
    const { adminId, userId, action, value } = await req.json();
    if (!adminId || !ADMIN_IDS.includes(Number(adminId))) {
      return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    switch (action) {
      case 'setRole':
        await prisma.user.update({ where: { id: userId }, data: { role: value } });
        return NextResponse.json({ success: true, message: `نقش به ${value} تغییر کرد` });

      case 'addBalance':
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: parseFloat(value) } },
          }),
          prisma.transaction.create({
            data: {
              userId,
              amount: parseFloat(value),
              type: 'GIFT',
              status: 'COMPLETED',
              description: 'افزودن موجودی توسط ادمین',
            },
          }),
        ]);
        return NextResponse.json({ success: true, message: `${value} تتر اضافه شد` });

      case 'ban':
        await prisma.user.update({ where: { id: userId }, data: { role: 'BANNED' as any } });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'action نامعتبر' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}