'use server';
// ============================================================
// WALLET SERVER ACTIONS — کیف پول و شارژ
// ============================================================
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { parseTelegramInitData, validateTelegramInitData } from '@/lib/telegram-auth';
import { Decimal } from '@prisma/client/runtime/library';
import type { ActionResult } from './user.action';

export type DepositRequestData = {
  id: number;
  amount: string;
  txHash: string | null;
  network: string;
  walletAddress: string;
  status: string;
  createdAt: string;
};

/**
 * ثبت درخواست شارژ با کریپتو
 */
export async function createDepositRequest(
  initData: string,
  amountUSDT: number,
  txHash: string,
  network: 'TRC20' | 'ERC20' = 'TRC20',
): Promise<ActionResult<DepositRequestData>> {
  if (process.env.NODE_ENV === 'production' && !validateTelegramInitData(initData)) {
    return { success: false, error: 'احراز هویت ناموفق.' };
  }

  const parsed = parseTelegramInitData(initData);
  if (!parsed) return { success: false, error: 'احراز هویت ناموفق.' };

  if (amountUSDT < 1) {
    return { success: false, error: 'حداقل مقدار شارژ ۱ USDT است.' };
  }

  if (!txHash || txHash.trim().length < 10) {
    return { success: false, error: 'هش تراکنش نامعتبر است.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(parsed.telegramId) },
      select: { id: true },
    });
    if (!user) return { success: false, error: 'کاربر پیدا نشد.' };

    // چک کردن تکراری نبودن txHash
    const existing = await prisma.depositRequest.findUnique({
      where: { txHash },
    });
    if (existing) {
      return { success: false, error: 'این هش تراکنش قبلاً ثبت شده.' };
    }

    const walletAddress = process.env.USER_WALLET_TRC20 || '';

    const deposit = await prisma.depositRequest.create({
      data: {
        userId: user.id,
        amount: new Decimal(amountUSDT),
        txHash: txHash.trim(),
        network,
        walletAddress,
        status: 'PENDING',
      },
    });

    revalidateTag(`user-${parsed.telegramId}`);

    return {
      success: true,
      data: {
        id: deposit.id,
        amount: deposit.amount.toString(),
        txHash: deposit.txHash,
        network: deposit.network,
        walletAddress: deposit.walletAddress,
        status: deposit.status,
        createdAt: deposit.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('[createDepositRequest] error:', error);
    return { success: false, error: 'خطای سرور.' };
  }
}

/**
 * تایید دستی توسط ادمین (از طریق ربات)
 */
export async function approveDeposit(
  depositId: number,
  adminTelegramId: string,
): Promise<ActionResult<{ newBalance: string }>> {
  // چک ادمین بودن
  if (adminTelegramId !== process.env.ADMIN_TELEGRAM_ID) {
    return { success: false, error: 'دسترسی ندارید.' };
  }

  try {
    const deposit = await prisma.depositRequest.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) return { success: false, error: 'درخواست پیدا نشد.' };
    if (deposit.status !== 'PENDING') {
      return { success: false, error: 'این درخواست قبلاً پردازش شده.' };
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      }),
      prisma.depositRequest.update({
        where: { id: depositId },
        data: { status: 'COMPLETED', verifiedAt: new Date() },
      }),
      prisma.transaction.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: `شارژ کیف پول — ${deposit.network}`,
          metadata: { txHash: deposit.txHash, network: deposit.network },
        },
      }),
    ]);

    revalidateTag(`user-${deposit.user.telegramId.toString()}`);

    return {
      success: true,
      data: { newBalance: updatedUser.balance.toString() },
    };
  } catch (error) {
    console.error('[approveDeposit] error:', error);
    return { success: false, error: 'خطای سرور.' };
  }
}
