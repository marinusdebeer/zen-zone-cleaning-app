'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@/generated/prisma';
import { prisma } from '../db';
import { withOrgContext, getOrgBySlug } from '../tenancy';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice';
import { auth } from '@/lib/auth';

export async function getInvoices(orgId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.invoice.findMany({
      include: {
        client: true,
        job: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
}

export async function getInvoice(orgId: string, invoiceId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        job: {
          include: {
            lineItems: true,
          },
        },
      },
    });
  });
}

export async function createInvoice(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createInvoiceSchema.parse(data);

  return withOrgContext(orgId, async () => {
    // Calculate total from line items
    const total = validatedData.lineItems.reduce((sum, item) => {
      const itemTotal = item.qty * item.unitPrice;
      const tax = item.taxRate ? itemTotal * (item.taxRate / 100) : 0;
      return sum + itemTotal + tax;
    }, 0);

    // Create invoice and line items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          orgId: org.id,
          jobId: validatedData.jobId,
          clientId: validatedData.clientId,
          total: new Prisma.Decimal(total.toString()),
          dueAt: validatedData.dueAt,
        },
        include: {
          client: true,
          job: true,
        },
      });

      // Create line items
      await tx.lineItem.createMany({
        data: validatedData.lineItems.map(item => ({
          orgId: org.id,
          jobId: validatedData.jobId,
          name: item.name,
          qty: item.qty,
          unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
          taxRate: item.taxRate ? new Prisma.Decimal(item.taxRate.toString()) : null,
        })),
      });

      return createdInvoice;
    });

    revalidatePath('/invoices');
    return invoice;
  });
}

export async function updateInvoice(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateInvoiceSchema.parse(data);
  const { id, lineItems, ...updateData } = validatedData;

  return withOrgContext(orgId, async () => {
    let total: number | undefined;
    
    // If line items are provided, recalculate total
    if (lineItems) {
      total = lineItems.reduce((sum, item) => {
        const itemTotal = item.qty * item.unitPrice;
        const tax = item.taxRate ? itemTotal * (item.taxRate / 100) : 0;
        return sum + itemTotal + tax;
      }, 0);
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...updateData,
        ...(total !== undefined && { total: new Prisma.Decimal(total.toString()) }),
      },
      include: {
        client: true,
        job: true,
      },
    });

    revalidatePath('/invoices');
    return invoice;
  });
}

export async function deleteInvoice(orgId: string, invoiceId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    revalidatePath('/invoices');
  });
}
