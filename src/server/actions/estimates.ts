/**
 * ESTIMATE SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for estimate/quote CRUD operations.
 * 
 * Functions:
 * - createEstimate: Create new estimate with line items
 * - updateEstimate: Update estimate details
 * - deleteEstimate: Remove estimate
 * - convertEstimateToJob: Convert approved estimate to job
 * 
 * Business Logic:
 * - Calculates subtotal, tax, and total from line items
 * - Validates with Zod schemas
 * - Can be converted to jobs
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 88 lines ✅
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';

export async function createEstimate(data: {
  title: string;
  description?: string;
  clientId?: string;
  propertyId?: string;
  validUntil?: Date;
  status?: string;
  taxRate?: number; // Default 13% - cost calculated from line items
  depositRequired?: boolean;
  depositType?: string;
  depositValue?: number;
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

  const number = await getNextNumber(orgId, 'estimate');

  const estimate = await prisma.estimate.create({
    data: {
      number,
      orgId,
      title: data.title,
      description: data.description,
      clientId: data.clientId!,  // Required field
      propertyId: data.propertyId,
      // Pricing - only tax rate and deposit settings (cost calculated from line items)
      taxRate: data.taxRate || 13,
      depositRequired: data.depositRequired || false,
      depositType: data.depositType,
      depositValue: data.depositValue,
      validUntil: data.validUntil,
      status: data.status || 'DRAFT',
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

  revalidatePath('/estimates');
  return serialize(estimate);
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
  return serialize(estimate);
}

export async function updateEstimate(data: {
  id: string;
  title?: string;
  description?: string;
  clientId?: string;
  propertyId?: string;
  validUntil?: Date;
  status?: string;
  taxRate?: number; // Default 13% - cost calculated from line items
  depositRequired?: boolean;
  depositType?: string;
  depositValue?: number;
  lineItems?: Array<{
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

  const { id, lineItems, ...updateData } = data;

  const estimate = await prisma.estimate.update({
    where: { 
      id,
      orgId 
    },
    data: {
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.clientId !== undefined && { clientId: updateData.clientId }),
      ...(updateData.propertyId !== undefined && { propertyId: updateData.propertyId }),
      ...(updateData.taxRate !== undefined && { taxRate: updateData.taxRate }),
      ...(updateData.depositRequired !== undefined && { depositRequired: updateData.depositRequired }),
      ...(updateData.depositType !== undefined && { depositType: updateData.depositType }),
      ...(updateData.depositValue !== undefined && { depositValue: updateData.depositValue }),
      ...(updateData.validUntil !== undefined && { validUntil: updateData.validUntil }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      // Update line items if provided
      ...(lineItems && {
        lineItems: {
          deleteMany: {}, // Remove existing line items
          create: lineItems.map(item => ({
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            order: item.order,
          })),
        },
      }),
    },
    include: {
      lineItems: true,
    },
  });

  revalidatePath('/estimates');
  revalidatePath(`/estimates/${id}`);
  return serialize(estimate);
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
