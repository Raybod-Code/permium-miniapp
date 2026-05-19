'use server';
// ============================================================
// PLAN SERVER ACTIONS — پلن‌های VPN
// ============================================================
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export type SerializedPlan = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  priceUSDT: string;
  durationDays: number;
  dataLimitGB: string | null;
  maxDevices: number;
  inboundId: number;
  isActive: boolean;
  sortOrder: number;
};

/**
 * دریافت پلن‌های فعال — با کش ۵ دقیقه‌ای
 */
export const getActivePlans = unstable_cache(
  async (): Promise<SerializedPlan[]> => {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      emoji: p.emoji,
      priceUSDT: p.priceUSDT.toString(),
      durationDays: p.durationDays,
      dataLimitGB: p.dataLimitGB?.toString() ?? null,
      maxDevices: p.maxDevices,
      inboundId: p.inboundId,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    }));
  },
  ['active-plans'],
  {
    revalidate: 300, // 5 دقیقه
    tags: ['plans'],
  },
);
