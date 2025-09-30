'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getLeads() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const leads = await prisma.lead.findMany({
    where: { orgId: selectedOrgId },
    include: {
      convertedClient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return leads;
}

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const lead = await prisma.lead.create({
    data: {
      orgId: selectedOrgId,
      name: data.name,
      emails: data.email ? [data.email] : [],
      phones: data.phone ? [data.phone] : [],
      addresses: data.address ? [data.address] : [],
      source: data.source || 'Website',
      status: 'NEW',
      notes: data.notes,
    },
  });

  revalidatePath('/leads');
  return lead;
}

export async function updateLeadStatus(leadId: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const lead = await prisma.lead.update({
    where: {
      id: leadId,
      orgId: selectedOrgId,
    },
    data: { status },
  });

  revalidatePath('/leads');
  return lead;
}

export async function convertLeadToClient(leadId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead || lead.orgId !== selectedOrgId) {
    throw new Error('Lead not found');
  }

  if (lead.convertedToClientId) {
    throw new Error('Lead already converted to client');
  }

  // Create client from lead
  const client = await prisma.client.create({
    data: {
      orgId: selectedOrgId,
      name: lead.name,
      emails: lead.emails,
      phones: lead.phones,
      addresses: lead.addresses,
      convertedFromLeadId: leadId,
    },
  });

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'CONVERTED',
      convertedToClientId: client.id,
    },
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  return client;
}

export async function deleteLead(leadId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  await prisma.lead.delete({
    where: {
      id: leadId,
      orgId: selectedOrgId,
    },
  });

  revalidatePath('/leads');
  return { success: true };
}
