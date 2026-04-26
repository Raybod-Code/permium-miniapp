import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subId = params.id;
    const subscription = await prisma.subscription.findFirst({
      where: { subLink: subId, status: 'ACTIVE' }
    });

    if (!subscription) return new NextResponse("Subscription Not Found", { status: 404 });

    // در اینجا محتوای کانفیگ را به صورت Base64 برمی‌گردانیم (استاندارد V2Ray)
    const configContent = Buffer.from(subscription.configUrl).toString('base64');
    
    return new NextResponse(configContent, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    return new NextResponse("Server Error", { status: 500 });
  }
}