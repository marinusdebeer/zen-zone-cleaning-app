'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPayments() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const payments = await prisma.payment.findMany({
    where: { orgId: selectedOrgId },
    include: {
      invoice: {
        include: {
          client: { select: { name: true } },
          job: { select: { title: true } }
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  });

  return payments;
}

export async function recordPayment(data: {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  paidAt?: Date;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Verify invoice belongs to org
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    select: { orgId: true, total: true, status: true }
  });

  if (!invoice || invoice.orgId !== selectedOrgId) {
    throw new Error('Invoice not found');
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      orgId: selectedOrgId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      paidAt: data.paidAt || new Date(),
    }
  });

  // Check if invoice is fully paid
  const totalPaid = await prisma.payment.aggregate({
    where: { invoiceId: data.invoiceId },
    _sum: { amount: true }
  });

  const totalPaidAmount = Number(totalPaid._sum.amount || 0);
  const invoiceTotal = Number(invoice.total);

  if (totalPaidAmount >= invoiceTotal) {
    // Mark invoice as paid
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });
  } else if (totalPaidAmount > 0) {
    // Partial payment
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { status: 'SENT' } // or could be PARTIAL_PAID if you want to add that status
    });
  }

  revalidatePath('/payments');
  revalidatePath('/invoices');
  return payment;
}

export async function getUnpaidInvoices() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const invoices = await prisma.invoice.findMany({
    where: {
      orgId: selectedOrgId,
      status: { in: ['DRAFT', 'SENT'] }
    },
    include: {
      client: { select: { name: true } },
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return invoices;
}

export async function deletePayment(paymentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true }
  });

  if (!payment || payment.orgId !== selectedOrgId) {
    throw new Error('Payment not found');
  }

  // Delete payment
  await prisma.payment.delete({
    where: { id: paymentId }
  });

  // Recalculate invoice status
  const totalPaid = await prisma.payment.aggregate({
    where: { invoiceId: payment.invoiceId },
    _sum: { amount: true }
  });

  const totalPaidAmount = Number(totalPaid._sum.amount || 0);
  const invoiceTotal = Number(payment.invoice.total);

  if (totalPaidAmount >= invoiceTotal) {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID', paidAt: new Date() }
    });
  } else if (totalPaidAmount > 0) {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'SENT', paidAt: null }
    });
  } else {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'DRAFT', paidAt: null }
    });
  }

  revalidatePath('/payments');
  revalidatePath('/invoices');
  return { success: true };
}
