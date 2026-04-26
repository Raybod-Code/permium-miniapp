import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pending = await prisma.transaction.findMany({
      where: { status: 'PENDING', type: 'DEPOSIT' },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pending);
  } catch (error) {
    return NextResponse.json({ error: 'خطا در دریافت لیست' }, { status: 500 });
  }
}