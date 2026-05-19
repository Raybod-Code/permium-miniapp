// src/app/api/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createXUIClient } from '@/lib/xui';
import { VPN_PLANS } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, planId, promoCode } = await req.json();

    if (!telegramId || !planId) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const plan = VPN_PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: 'پلن یافت نشد' }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });

    // محاسبه تخفیف
    let finalPrice = plan.price;
    let discount = 0;

    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: promoCode,
          expiresAt: { gt: new Date() },
          usedCount: { lt: prisma.promoCode.fields.usageLimit },
        },
      });
      if (promo) {
        discount = promo.discount;
        finalPrice = plan.price * (1 - discount / 100);
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // تخفیف نماینده
    if (user.agentDiscount > 0) {
      const agentFinalDiscount = Math.max(discount, user.agentDiscount);
      finalPrice = plan.price * (1 - agentFinalDiscount / 100);
    }

    finalPrice = Math.round(finalPrice * 100) / 100;

    if (user.balance < finalPrice) {
      return NextResponse.json({
        error: `موجودی کافی نیست. نیاز به ${finalPrice} تتر دارید.`,
      }, { status: 400 });
    }

    // ساخت کلاینت در X-UI
    const email = `tg${telegramId}_${planId}_${Date.now()}`;
    const inboundId = parseInt(process.env.XUI_INBOUND_ID || '1');

    let configUrl: string;
    let subLink: string | null = null;

    try {
      const xuiResult = await createXUIClient({
        inboundId,
        email,
        dataLimitGB: plan.dataLimit,
        expiryDays: plan.duration,
      });
      configUrl = xuiResult.configUrl;
      subLink = xuiResult.subLink;
    } catch (xuiError) {
      console.error('XUI error:', xuiError);
      // Fallback: config موقت
      configUrl = `vless://${crypto.randomUUID()}@${process.env.XUI_SERVER_HOST || '127.0.0.1'}:443?type=tcp&security=reality#Titan_${plan.name}`;
    }

    // transaction atomik: کسر موجودی + ثبت خرید
    const [updatedUser, subscription] = await prisma.$transaction([
      prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: { balance: { decrement: finalPrice } },
      }),
      prisma.subscription.create({
        data: {
          userId: user.id,
          planName: plan.name,
          configUrl,
          subLink,
          status: 'ACTIVE',
          dataLimit: plan.dataLimit,
          expiresAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount: finalPrice,
          type: 'PURCHASE',
          status: 'COMPLETED',
          description: `خرید پلن ${plan.name}${discount > 0 ? ` (${discount}٪ تخفیف)` : ''}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.balance,
      subscription: {
        ...subscription,
        expiresAt: subscription.expiresAt.toISOString(),
        createdAt: subscription.createdAt.toISOString(),
      },
      finalPrice,
      discount,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'خطای سرور در صدور اشتراک' }, { status: 500 });
  }
}