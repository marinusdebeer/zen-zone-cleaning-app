/**
 * VISIT LINE ITEMS SERVER ACTIONS
 * 
 * Purpose:
 * Manage visit-specific line items independent of job line items
 * 
 * Functions:
 * - updateVisitLineItems: Update line items for a specific visit
 * - getVisitWithLineItems: Fetch visit with line items and invoice status
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { withOrgContext } from '../tenancy';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';

export async function updateVisitLineItems(visitId: string, lineItems: Array<{
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  order: number;
}>) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(orgId, async () => {
    // Verify visit exists and is not already invoiced
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new Error('Visit not found');
    }

    if (visit.invoiceId) {
      throw new Error('Cannot modify line items for an invoiced visit');
    }

    // Delete existing line items
    await prisma.visitLineItem.deleteMany({
      where: { visitId },
    });

    // Create new line items
    if (lineItems.length > 0) {
      await prisma.visitLineItem.createMany({
        data: lineItems.map(item => ({
          visitId,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          order: item.order,
        })),
      });
    }

    // Fetch updated visit
    const updatedVisit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
        invoice: true,
      },
    });

    revalidatePath('/schedule');
    revalidatePath(`/jobs/${visit.jobId}`);
    
    return serialize(updatedVisit);
  });
}

export async function getVisitWithLineItems(visitId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(orgId, async () => {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
      invoice: {
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
        },
      },
      },
    });

    if (!visit) {
      throw new Error('Visit not found');
    }

    return serialize(visit);
  });
}

export async function getInvoiceableVisits(jobId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(orgId, async () => {
    const visits = await prisma.visit.findMany({
      where: {
        jobId,
        status: 'Completed',
        invoiceId: null, // Not yet invoiced
      },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    return serialize(visits);
  });
}

