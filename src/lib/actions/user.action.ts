'use server';
// ============================================================
// USER SERVER ACTIONS
// تمام عملیات مربوط به کاربر — بدون API Route
// ============================================================
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { validateTelegramInitData, parseTelegramInitData } from '@/lib/telegram-auth';
import { Decimal } from '@prisma/client/runtime/library';

// ─── Types ───────────────────────────────────────────────────
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── upsertUser ──────────────────────────────────────────────
/**
 * ثبت‌نام / لاگین کاربر از طریق Telegram InitData
 * این اولین Server Action‌ایه که روی هر بار load اپ صدا زده میشه
 */
export async function upsertUser(
  initData: string,
  referralCode?: string,
): Promise<ActionResult<SerializedUser>> {
  // 1. اعتبارسنجی Telegram InitData
  if (process.env.NODE_ENV === 'production') {
    if (!validateTelegramInitData(initData)) {
      return { success: false, error: 'احراز هویت ناموفق بود.' };
    }
  }

  const parsed = parseTelegramInitData(initData);
  if (!parsed) {
    return { success: false, error: 'اطلاعات کاربر دریافت نشد.' };
  }

  const { telegramId, firstName, username } = parsed;

  try {
    // 2. پیدا کردن معرف (اگه از رفرال اومده)
    let referrerId: number | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode },
        select: { id: true },
      });
      referrerId = referrer?.id ?? null;
    }

    // 3. upsert کاربر
    const isNewUser = !(await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      select: { id: true },
    }));

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: {
        firstName: firstName || undefined,
        username: username || undefined,
        updatedAt: new Date(),
      },
      create: {
        telegramId: BigInt(telegramId),
        firstName: firstName || 'کاربر',
        username: username ?? null,
        referredBy: referrerId,
      },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        devices: {
          where: { isActive: true },
          orderBy: { lastSeenAt: 'desc' },
        },
      },
    });

    // 4. پاداش رفرال برای کاربر جدید
    if (isNewUser && referrerId) {
      await giveReferralBonus(referrerId);
    }

    revalidateTag(`user-${telegramId}`);

    return { success: true, data: serializeUser(user) };
  } catch (error) {
    console.error('[upsertUser] error:', error);
    return { success: false, error: 'خطای سرور. لطفاً دوباره تلاش کنید.' };
  }
}

// ─── getUserById ─────────────────────────────────────────────
export async function getUserByTelegramId(
  telegramId: string,
): Promise<ActionResult<SerializedUser>> {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        devices: {
          where: { isActive: true },
          orderBy: { lastSeenAt: 'desc' },
        },
      },
    });

    if (!user) return { success: false, error: 'کاربر پیدا نشد.' };

    return { success: true, data: serializeUser(user) };
  } catch (error) {
    console.error('[getUserByTelegramId] error:', error);
    return { success: false, error: 'خطای سرور.' };
  }
}

// ─── kickDevice ──────────────────────────────────────────────
/**
 * اخراج دستگاه — رفع باگ handleKickDevice
 */
export async function kickDevice(
  initData: string,
  deviceId: number,
): Promise<ActionResult<{ message: string }>> {
  const parsed = parseTelegramInitData(initData);
  if (!parsed) return { success: false, error: 'احراز هویت ناموفق.' };

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(parsed.telegramId) },
      select: { id: true },
    });
    if (!user) return { success: false, error: 'کاربر پیدا نشد.' };

    // اطمینان از اینکه دستگاه متعلق به این کاربر هست
    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: user.id },
    });
    if (!device) return { success: false, error: 'دستگاه پیدا نشد.' };

    await prisma.device.update({
      where: { id: deviceId },
      data: { isActive: false },
    });

    revalidateTag(`user-${parsed.telegramId}`);
    return { success: true, data: { message: 'دستگاه با موفقیت حذف شد.' } };
  } catch (error) {
    console.error('[kickDevice] error:', error);
    return { success: false, error: 'خطای سرور.' };
  }
}

// ─── Internal Helpers ─────────────────────────────────────────
async function giveReferralBonus(referrerId: number) {
  const BONUS = new Decimal('0.5');
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: referrerId },
        data: {
          balance: { increment: BONUS },
          referralEarned: { increment: BONUS },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: referrerId,
          amount: BONUS,
          type: 'REFERRAL_BONUS',
          status: 'COMPLETED',
          description: '🎁 پاداش دعوت کاربر جدید',
        },
      }),
    ]);
  } catch (err) {
    console.error('[giveReferralBonus] error:', err);
  }
}

// ─── Serializer (BigInt & Decimal → JSON-safe) ────────────────
type UserWithRelations = Awaited<ReturnType<typeof prisma.user.findUnique>> & {
  subscriptions?: any[];
  transactions?: any[];
  devices?: any[];
};

export type SerializedUser = ReturnType<typeof serializeUser>;

function serializeUser(user: NonNullable<UserWithRelations>) {
  return {
    id: user.id,
    telegramId: user.telegramId.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    balance: user.balance.toString(),
    role: user.role,
    isBanned: user.isBanned,
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    referralEarned: user.referralEarned.toString(),
    agentDiscount: user.agentDiscount,
    agentCommission: user.agentCommission,
    agentBrandName: user.agentBrandName,
    agentBrandLogo: user.agentBrandLogo,
    lastSpinDate: user.lastSpinDate?.toISOString() ?? null,
    totalSpins: user.totalSpins,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    // Relations
    subscriptions: (user.subscriptions ?? []).map((s) => ({
      id: s.id,
      planName: s.planName,
      configUrl: s.configUrl,
      subLink: s.subLink,
      status: s.status,
      dataLimitGB: s.dataLimitGB?.toString() ?? null,
      dataUsedGB: s.dataUsedGB.toString(),
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
    transactions: (user.transactions ?? []).map((t) => ({
      id: t.id,
      amount: t.amount.toString(),
      type: t.type,
      status: t.status,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
    devices: (user.devices ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      deviceType: d.deviceType,
      lastIp: d.lastIp,
      lastSeenAt: d.lastSeenAt.toISOString(),
      isActive: d.isActive,
    })),
    isVip: (user.subscriptions ?? []).length > 0,
    activeSubscription: (user.subscriptions ?? [])[0] ?? null,
  };
}
