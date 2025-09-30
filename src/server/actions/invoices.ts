'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';

export async function createInvoice(data: {
  clientId: string;
  jobId?: string;
  visitIds?: string[];
  subtotal: number;
  taxRate: number;
  dueDate?: Date;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  // Verify client belongs to this org
  const client = await prisma.client.findUnique({
    where: { id: data.clientId }
  });

  if (!client || client.orgId !== orgId) {
    throw new Error('Client not found');
  }

  // If job is provided, verify it belongs to this org
  if (data.jobId) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId }
    });

    if (!job || job.orgId !== orgId) {
      throw new Error('Job not found');
    }
  }

  const taxAmount = data.subtotal * (data.taxRate / 100);
  const total = data.subtotal + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      orgId,
      jobId: data.jobId || null,
      clientId: data.clientId,
      visitIds: data.visitIds || [],
      subtotal: data.subtotal,
      taxAmount: taxAmount,
      total: total,
      status: 'DRAFT',
      issuedAt: new Date(),
      dueAt: data.dueDate || null,
      custom: data.notes ? { notes: data.notes } : {},
    },
  });

  revalidatePath('/invoices');
  return invoice;
}

export async function getClientsForInvoicing(orgId: string) {
  return await prisma.client.findMany({
    where: { orgId },
    select: {
      id: true,
      name: true,
      emails: true,
    },
    orderBy: { name: 'asc' }
  });
}

export async function getJobsForInvoicing(orgId: string) {
  const jobs = await prisma.job.findMany({
    where: {
      orgId,
      status: { in: ['Active', 'Completed'] },
    },
    include: {
      client: { select: { id: true, name: true } },
      property: { select: { address: true } },
      visits: {
        select: {
          id: true,
          scheduledAt: true,
          completedAt: true,
          status: true,
        },
        orderBy: { scheduledAt: 'desc' }
      },
      invoices: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Convert Decimal to Number for client component
  return jobs.map(job => ({
    ...job,
    estimatedCost: job.estimatedCost ? Number(job.estimatedCost) : null
  }));
}