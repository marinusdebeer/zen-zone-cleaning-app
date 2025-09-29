'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../db';
import { withOrgContext, getOrgBySlug } from '../tenancy';
import { createClientSchema, updateClientSchema } from '../validators/client';
import { auth } from '@/lib/auth';

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
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        orgId: orgId,
      },
    });

    revalidatePath('/clients');
    return client;
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
    return client;
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
