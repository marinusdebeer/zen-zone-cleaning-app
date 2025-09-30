'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';

export async function createEstimate(data: {
  title: string;
  description?: string;
  leadId?: string;
  clientId?: string;
  propertyId?: string;
  amount: number;
  validUntil?: Date;
  status?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  const estimate = await prisma.estimate.create({
    data: {
      orgId,
      title: data.title,
      description: data.description || null,
      leadId: data.leadId || null,
      clientId: data.clientId || null,
      propertyId: data.propertyId || null,
      amount: data.amount,
      validUntil: data.validUntil || null,
      status: data.status || 'DRAFT',
      custom: {},
    },
  });

  revalidatePath('/estimates');
  return estimate;
}

export async function updateEstimateStatus(estimateId: string, status: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  const estimate = await prisma.estimate.update({
    where: { 
      id: estimateId,
      orgId 
    },
    data: { status },
  });

  revalidatePath('/estimates');
  return estimate;
}

export async function deleteEstimate(estimateId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orgId = (session as any).selectedOrgId;
  if (!orgId) {
    throw new Error('No organization selected');
  }

  await prisma.estimate.delete({
    where: { 
      id: estimateId,
      orgId 
    },
  });

  revalidatePath('/estimates');
}
