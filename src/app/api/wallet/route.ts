// src/app/api/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USDT_WALLET = process.env.USDT_WALLET_ADDRESS || 'TXXXxxxxYourTetherWalletHere';
const MIN_DEPOSIT = 5; // حداقل ۵ تتر
const EXCHANGE_RATE = parseFloat(process.env.USDT_TO_IRT_RATE || '100000'); // نرخ تتر به تومان

export async function POST(req: NextRequest) {
  try {
    const { telegramId, amount, method, txid } = await req.json();

    if (!telegramId || !amount || !method) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const amountFloat = parseFloat(amount);
    if (amountFloat < MIN_DEPOSIT) {
      return NextResponse.json({
        error: `حداقل مبلغ شارژ ${MIN_DEPOSIT} تتر است`,
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    // بررسی TXID تکراری
    if (txid) {
      const duplicate = await prisma.transaction.findFirst({
        where: { description: { contains: txid } },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'این تراکنش قبلاً ثبت شده است' }, { status: 400 });
      }
    }

    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amountFloat,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: `شارژ از طریق ${method}${txid ? ` | TXID: ${txid}` : ''}`,
      },
    });

    return NextResponse.json({
      success: true,
      walletAddress: USDT_WALLET,
      network: 'TRC-20',
      amount: amountFloat,
      message: 'درخواست شارژ ثبت شد. پس از تایید ادمین به موجودی اضافه می‌شود.',
    });
  } catch (error) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

// GET — گرفتن آدرس کیف پول و اطلاعات شارژ
export async function GET() {
  return NextResponse.json({
    usdtAddress: USDT_WALLET,
    network: 'TRC-20',
    minDeposit: MIN_DEPOSIT,
    exchangeRate: EXCHANGE_RATE,
    processingTime: '۵ تا ۳۰ دقیقه',
  });
}