/**
 * ESTIMATE EMAIL SERVER ACTIONS
 * 
 * Purpose:
 * Server actions for sending estimates via email or SMS
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { withOrgContext } from '../tenancy';
import { sendEstimateEmail } from '@/lib/email-estimate';
import { sendEstimateSMS } from '@/lib/sms';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';
import { calculateFullPricing } from '@/lib/pricing-calculator';
import { getClientDisplayName } from '@/lib/client-utils';

export async function sendEstimate(data: {
  estimateId: string;
  method: 'email' | 'sms';
  to: string;
  subject?: string;
  body: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  // Fetch estimate to get details
  const estimate = await withOrgContext(selectedOrgId, async () => {
    return await prisma.estimate.findUnique({
      where: { id: data.estimateId },
      include: {
        client: true,
        lineItems: true,
      },
    });
  });

  if (!estimate) {
    throw new Error('Estimate not found');
  }

  // Calculate pricing from line items
  const pricing = calculateFullPricing({
    lineItems: estimate.lineItems.map(item => ({
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    taxRate: Number(estimate.taxRate),
    depositRequired: estimate.depositRequired,
    depositType: estimate.depositType,
    depositValue: estimate.depositValue ? Number(estimate.depositValue) : undefined,
  });

  const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const estimateUrl = `${APP_URL}/estimates/${estimate.id}`;

  // Send via email or SMS
  if (data.method === 'email') {
    await sendEstimateEmail({
      to: data.to,
      subject: data.subject || `Estimate for ${estimate.title}`,
      body: data.body,
      estimateId: estimate.id,
      clientName: estimate.client ? getClientDisplayName(estimate.client) : 'Unknown',
      estimateTitle: estimate.title,
      estimateTotal: pricing.total,
      attachments: data.attachments,
    });
  } else if (data.method === 'sms') {
    await sendEstimateSMS({
      to: data.to,
      estimateTitle: estimate.title,
      estimateTotal: pricing.total,
      estimateUrl,
    });
  }

  // Update estimate status to SENT
  await withOrgContext(selectedOrgId, async () => {
    await prisma.estimate.update({
      where: { id: data.estimateId },
      data: { status: 'SENT' },
    });
  });

  revalidatePath('/estimates');
  revalidatePath(`/estimates/${data.estimateId}`);

  return { success: true };
}

export async function approveEstimate(estimateId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  const estimate = await withOrgContext(selectedOrgId, async () => {
    return await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: 'APPROVED' },
    });
  });

  revalidatePath('/estimates');
  revalidatePath(`/estimates/${estimateId}`);

  return serialize(estimate);
}

export async function rejectEstimate(estimateId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  const estimate = await withOrgContext(selectedOrgId, async () => {
    return await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: 'REJECTED' },
    });
  });

  revalidatePath('/estimates');
  revalidatePath(`/estimates/${estimateId}`);

  return serialize(estimate);
}

