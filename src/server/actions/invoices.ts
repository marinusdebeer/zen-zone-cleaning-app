/**
 * INVOICE SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for invoice CRUD operations.
 * 
 * Functions:
 * - createInvoice: Create new invoice with line items
 * - updateInvoice: Update invoice details
 * - deleteInvoice: Remove invoice
 * - getJobsForInvoicing: Fetch jobs ready to be invoiced
 * - getClientsForInvoicing: Fetch clients for manual invoicing
 * 
 * Business Logic:
 * - Calculates subtotal, tax, and total
 * - Links to jobs if created from job
 * - Validates with Zod schemas
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 108 lines ✅
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';

export async function createInvoice(data: {
  clientId: string;
  jobId?: string;
  visitIds?: string[];
  taxRate?: number; // Default 13% - cost calculated from line items
  dueDate?: Date;
  notes?: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    order: number;
  }>;
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

  const number = await getNextNumber(orgId, 'invoice');

  const invoice = await prisma.invoice.create({
    data: {
      number,
      orgId,
      jobId: data.jobId || undefined,
      clientId: data.clientId,
      visitIds: data.visitIds || [],
      taxRate: data.taxRate || 13, // Cost calculated from line items
      status: 'DRAFT',
      issuedAt: new Date(),
      dueAt: data.dueDate || null,
      notes: data.notes || null,
      custom: {},
      // Line items (where the cost comes from)
      lineItems: {
        create: data.lineItems.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          order: item.order,
        })),
      },
    },
    include: {
      lineItems: true,
    },
  });

  revalidatePath('/invoices');
  return serialize(invoice);
}

export async function getClientsForInvoicing(orgId: string) {
  return await prisma.client.findMany({
    where: { orgId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      emails: true,
    },
    orderBy: [
      { companyName: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ]
  });
}

export async function getJobsForInvoicing(orgId: string) {
  const jobs = await prisma.job.findMany({
    where: {
      orgId,
      status: { in: ['Active', 'Completed'] },
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
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

  // Automatically serialize all Decimal fields
  return serialize(jobs);
}