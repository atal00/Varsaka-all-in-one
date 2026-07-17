'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

async function checkMasterAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.email !== 'invoice@varsaka.com') {
    throw new Error('Forbidden: Only the Master Admin can perform this action.');
  }
}

export async function getBlockedIps() {
  await checkMasterAdmin();
  return prisma.ipBlock.findMany({
    where: { app: 'invoice' },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function unblockIp(ip: string) {
  await checkMasterAdmin();
  
  await prisma.ipBlock.update({
    where: { ip_app: { ip, app: 'invoice' } },
    data: { blockedUntil: null, failedAttempts: 0, isPermanent: false }
  });
  
  revalidatePath('/admin/security');
}

export async function togglePermanentBlock(ip: string, isPermanent: boolean) {
  await checkMasterAdmin();
  
  await prisma.ipBlock.update({
    where: { ip_app: { ip, app: 'invoice' } },
    data: { isPermanent }
  });
  
  revalidatePath('/admin/security');
}

export async function deleteIpBlock(ip: string) {
  await checkMasterAdmin();
  
  await prisma.ipBlock.delete({
    where: { ip_app: { ip, app: 'invoice' } }
  });
  
  revalidatePath('/admin/security');
}
