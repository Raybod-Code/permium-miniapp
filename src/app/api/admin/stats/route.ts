// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(Number);

export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get('adminId');
  if (!adminId || !ADMIN_IDS.includes(Number(adminId))) {
    return NextResponse.json({ error: 'دسترسی ندارید' }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    todayNewUsers,
    activeSubscriptions,
    pendingDeposits,
    totalRevenue,
    todayRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.transaction.count({ where: { status: 'PENDING', type: 'DEPOSIT' } }),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED', type: 'PURCHASE' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED', type: 'PURCHASE', createdAt: { gte: today } },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    todayNewUsers,
    activeSubscriptions,
    pendingDeposits,
    totalRevenue: totalRevenue._sum.amount || 0,
    todayRevenue: todayRevenue._sum.amount || 0,
  });
}