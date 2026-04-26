import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { telegramId } = await request.json();
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });

    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    if (user.role === 'AGENT' || user.role === 'ADMIN') {
      return NextResponse.json({ error: 'شما در حال حاضر نماینده هستید!' }, { status: 400 });
    }
    if (user.balance < 50) {
      return NextResponse.json({ error: 'موجودی کافی نیست! حداقل ۵۰ تتر نیاز است.' }, { status: 400 });
    }

    // کسر 50 تتر، ارتقا به نماینده و دادن 30٪ تخفیف اختصاصی
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        balance: { decrement: 50 },
        role: 'AGENT',
        agentDiscount: 30 
      }
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 50,
        type: 'AGENT_UPGRADE',
        status: 'COMPLETED',
        description: 'ارتقا به پنل همکاران تایتان'
      }
    });

    return NextResponse.json({ success: true, message: 'تبریک! شما به نماینده تایتان ارتقا یافتید.' });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}