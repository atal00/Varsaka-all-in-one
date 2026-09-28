'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Optimized database-level aggregation for Dashboard Metrics.
 * Computes Total Revenue (Paid), Total Invoices, and Outstanding in a single
 * index-assisted query without loading all invoice records into memory.
 */
export async function getDashboardMetrics() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const metricsGroup = await prisma.invoice.groupBy({
    by: ['status'],
    where: { userId },
    _sum: { total: true },
    _count: { _all: true }
  });

  let totalRevenue = 0;
  let totalOutstanding = 0;
  let totalInvoices = 0;

  for (const group of metricsGroup) {
    const count = group._count._all || 0;
    const sum = group._sum.total || 0;
    totalInvoices += count;

    if (group.status === 'Paid') {
      totalRevenue += sum;
    } else if (group.status === 'Pending' || group.status === 'Overdue' || group.status === 'Sent') {
      totalOutstanding += sum;
    }
  }

  return {
    totalRevenue,
    totalInvoices,
    totalOutstanding
  };
}

/**
 * Optimized query for Recent Invoices.
 * Selects only the columns needed by the dashboard table and limits rows.
 */
export async function getRecentInvoices(limit: number = 5) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  return prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      issueDate: true,
      status: true,
      currency: true,
      total: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

/**
 * Debounced search endpoint for search bar.
 */
export async function searchInvoices(query: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.invoice.findMany({
    where: {
      userId,
      OR: [
        { invoiceNumber: { contains: trimmed, mode: 'insensitive' } },
        { clientName: { contains: trimmed, mode: 'insensitive' } },
        { clientEmail: { contains: trimmed, mode: 'insensitive' } },
      ]
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      issueDate: true,
      status: true,
      currency: true,
      total: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });
}

export async function getInvoices() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  return prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      issueDate: true,
      dueDate: true,
      status: true,
      currency: true,
      total: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getInvoiceById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lineItems: true }
  });

  if (!invoice || invoice.userId !== userId) {
    throw new Error("Unauthorized or not found");
  }

  return invoice;
}

export async function deleteInvoice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (invoice?.userId !== userId) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.invoice.delete({ where: { id } });
  revalidatePath('/dashboard');
}

export async function saveInvoiceToDb(payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const { id, lineItems, ...invoiceData } = payload;

  if (id) {
    // Verify ownership before updating
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (existing && existing.userId !== userId) {
      throw new Error("Unauthorized to modify this invoice");
    }
  }
  
  if (id) {
    await prisma.invoice.update({
      where: { id },
      data: { 
        ...invoiceData,
        userId,
        lineItems: { deleteMany: {}, create: lineItems } 
      }
    });
  } else {
    await prisma.invoice.create({
      data: { 
        ...invoiceData,
        userId,
        lineItems: { create: lineItems } 
      }
    });
  }
  
  revalidatePath('/dashboard');
}

export async function updateInvoiceStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (invoice?.userId !== userId) {
    throw new Error("Unauthorized or not found");
  }

  await prisma.invoice.update({
    where: { id },
    data: { status }
  });

  revalidatePath('/dashboard');
}
