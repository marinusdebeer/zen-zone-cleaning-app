/**
 * PAYMENT SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for payment recording and tracking.
 * 
 * Functions:
 * - createPayment: Record new payment against invoice
 * - getPayments: Fetch all payments for organization
 * - getUnpaidInvoices: Fetch invoices with outstanding balance
 * 
 * Business Logic:
 * - Links payments to invoices
 * - Tracks payment method (Cash, Check, Card, Bank Transfer)
 * - Auto-updates invoice payment status
 * - Serializes Decimal amounts
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 170 lines ✅
 */

'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';
import { calculateFullPricing } from '@/lib/pricing-calculator';

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
          client: { select: { firstName: true, lastName: true, companyName: true } },
          job: { select: { title: true } }
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  });

  return serialize(payments);
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

  // Verify invoice belongs to org and get line items to calculate total
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    select: { 
      orgId: true, 
      status: true, 
      taxRate: true,
      lineItems: true 
    }
  });

  if (!invoice || invoice.orgId !== selectedOrgId) {
    throw new Error('Invoice not found');
  }

  // Calculate invoice total from line items (snapshot at payment time)
  const pricing = calculateFullPricing({
    lineItems: invoice.lineItems.map(item => ({
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
    taxRate: Number(invoice.taxRate),
  });

  const number = await getNextNumber(selectedOrgId, 'payment');

  // Create payment with invoice total snapshot
  const payment = await prisma.payment.create({
    data: {
      number,
      orgId: selectedOrgId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      invoiceTotal: pricing.total, // Snapshot of invoice total at payment time
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      paidAt: data.paidAt || new Date(),
    }
  });

  // Mark invoice as PAID automatically when payment is recorded
  await prisma.invoice.update({
    where: { id: data.invoiceId },
    data: { 
      status: 'PAID',
      paidAt: new Date(),
    }
  });

  revalidatePath('/payments');
  revalidatePath('/invoices');
  return serialize(payment);
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
      client: { select: { firstName: true, lastName: true, companyName: true } },
      payments: true,
      lineItems: true // For calculating totals
    },
    orderBy: { createdAt: 'desc' }
  });

  return serialize(invoices);
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

  // Check if invoice still has any payments
  const remainingPayments = await prisma.payment.count({
    where: { invoiceId: payment.invoiceId }
  });

  // If no payments left, mark invoice as unpaid
  if (remainingPayments === 0) {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'SENT', paidAt: null }
    });
  }

  revalidatePath('/payments');
  revalidatePath('/invoices');
  return { success: true };
}
