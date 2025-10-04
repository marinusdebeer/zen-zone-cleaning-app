/**
 * REQUEST SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for service requests
 * 
 * Functions:
 * - createRequest: Create new customer request
 * - updateRequest: Update request details
 * - deleteRequest: Remove request
 * - updateRequestStatus: Update request status
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../db';
import { withOrgContext } from '../tenancy';
import { createRequestSchema, updateRequestSchema } from '../validators/request';
import { auth } from '@/lib/auth';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';

export async function createRequest(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createRequestSchema.parse(data);

  return withOrgContext(orgId, async () => {
    const number = await getNextNumber(orgId, 'request');

    const request = await prisma.request.create({
      data: {
        number,
        orgId,
        ...validatedData,
        status: 'NEW',
        custom: {},
      },
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath('/requests');
    return serialize(request);
  });
}

export async function updateRequest(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateRequestSchema.parse(data);
  const { id, ...updateData } = validatedData;

  return withOrgContext(orgId, async () => {
    const request = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${id}`);
    return serialize(request);
  });
}

export async function updateRequestStatus(orgId: string, requestId: string, status: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    const request = await prisma.request.update({
      where: { id: requestId },
      data: { status },
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    return serialize(request);
  });
}

export async function deleteRequest(orgId: string, requestId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    await prisma.request.delete({
      where: { id: requestId },
    });

    revalidatePath('/requests');
  });
}

