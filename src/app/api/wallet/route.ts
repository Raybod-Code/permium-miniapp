import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { telegramId, amount, method } = await request.json();

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    // ثبت درخواست شارژ (وضعیت: در انتظار تایید ادمین)
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        description: `درخواست شارژ از طریق ${method}`
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'درخواست شارژ شما با موفقیت ثبت شد و پس از تایید به موجودی اضافه می‌شود.' 
    });

  } catch (error) {
    console.error("Wallet Deposit Error:", error);
    return NextResponse.json({ error: 'خطا در ثبت درخواست' }, { status: 500 });
  }
}