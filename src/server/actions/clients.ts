/**
 * CLIENT SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for client CRUD operations.
 * 
 * Functions:
 * - createClient: Create new client with contact info
 * - updateClient: Update client details
 * - deleteClient: Remove client
 * - getClientById: Fetch single client with relations
 * 
 * Business Logic:
 * - Validates email/phone JSON arrays
 * - Uses Zod schema validation
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 87 lines ✅
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../db';
import { withOrgContext, getOrgBySlug } from '../tenancy';
import { createClientSchema, updateClientSchema } from '../validators/client';
import { auth } from '@/lib/auth';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';

export async function getClients(orgId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
}

export async function getClient(orgId: string, clientId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
        },
        properties: true,
      },
    });
  });
}

export async function createClient(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createClientSchema.parse(data);

  return withOrgContext(orgId, async () => {
    const number = await getNextNumber(orgId, 'client');

    const client = await prisma.client.create({
      data: {
        number,
        ...validatedData,
        orgId: orgId,
      },
    });

    revalidatePath('/clients');
    return serialize(client);
  });
}

export async function updateClient(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateClientSchema.parse(data);
  const { id, ...updateData } = validatedData;

  return withOrgContext(orgId, async () => {
    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return serialize(client);
  });
}

export async function deleteClient(orgId: string, clientId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    await prisma.client.delete({
      where: { id: clientId },
    });

    revalidatePath('/clients');
  });
}
