import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// لیست جوایز (احتمال برنده شدن هر کدام را می‌توانی بعداً تغییر دهی)
const PRIZES = [
  { id: 1, name: 'پوچ', type: 'NONE', value: 0, color: 'bg-gray-700' },
  { id: 2, name: '۰.۵ تتر هدیه', type: 'USDT', value: 0.5, color: 'bg-emerald-600' },
  { id: 3, name: 'پوچ', type: 'NONE', value: 0, color: 'bg-gray-700' },
  { id: 4, name: '۱ تتر هدیه', type: 'USDT', value: 1.0, color: 'bg-indigo-600' },
  { id: 5, name: 'پوچ', type: 'NONE', value: 0, color: 'bg-gray-700' },
  { id: 6, name: 'کد تخفیف ۱۰٪', type: 'DISCOUNT', value: 10, color: 'bg-amber-600' },
];

export async function POST(request: Request) {
  try {
    const { telegramId } = await request.json();
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });

    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    // بررسی زمان آخرین چرخش (محدودیت ۲۴ ساعته)
    if (user.lastSpinDate) {
      const hoursSinceLastSpin = (new Date().getTime() - new Date(user.lastSpinDate).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSpin < 24) {
        const remainingHours = Math.ceil(24 - hoursSinceLastSpin);
        return NextResponse.json({ error: `تا چرخش بعدی ${remainingHours} ساعت زمان باقیست.` }, { status: 400 });
      }
    }

    // انتخاب تصادفی جایزه
    const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];

    // اعمال جایزه در دیتابیس
    let updateData: any = { lastSpinDate: new Date() };
    if (randomPrize.type === 'USDT') {
      updateData.balance = { increment: randomPrize.value };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    if (randomPrize.type === 'USDT') {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: randomPrize.value,
          type: 'GIFT',
          status: 'COMPLETED',
          description: 'جایزه گردونه شانس روزانه'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      prize: randomPrize,
      message: randomPrize.type === 'NONE' ? 'شاید فردا خوش‌شانس‌تر باشی!' : `تبریک! ${randomPrize.name} برنده شدی!`
    });

  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور در چرخش گردونه' }, { status: 500 });
  }
}