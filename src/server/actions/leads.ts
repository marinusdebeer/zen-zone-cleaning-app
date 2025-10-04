/**
 * LEAD SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for lead management.
 * Uses unified Client model with clientStatus = 'LEAD'.
 * 
 * Functions:
 * - createLead: Create new client with LEAD status
 * - updateLeadStatus: Update lead status
 * - convertLeadToClient: Change clientStatus from LEAD to ACTIVE
 * - getLeads: Fetch all clients with LEAD status
 * 
 * Business Logic:
 * - Tracks lead status (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
 * - "Converting" just changes clientStatus to ACTIVE
 * - No separate tables - unified Client model
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines
 */

'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get all leads (clients with LEAD status)
 * Uses unified Client model
 */
export async function getLeads() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const leads = await prisma.client.findMany({
    where: { 
      orgId: selectedOrgId,
      clientStatus: 'LEAD'
    },
    orderBy: { createdAt: 'desc' },
  });

  return leads;
}

/**
 * Create new lead (client with LEAD status)
 */
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

  const lead = await prisma.client.create({
    data: {
      orgId: selectedOrgId,
      name: data.name,
      emails: data.email ? [data.email] : [],
      phones: data.phone ? [data.phone] : [],
      addresses: data.address ? [data.address] : [],
      clientStatus: 'LEAD',
      leadSource: data.source || 'website',
      leadStatus: 'NEW',
      notes: data.notes,
    },
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  return lead;
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const lead = await prisma.client.update({
    where: {
      id: leadId,
      orgId: selectedOrgId,
    },
    data: { leadStatus: status },
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  return lead;
}

/**
 * Convert lead to active client
 * Simply changes clientStatus from LEAD to ACTIVE
 */
export async function convertLeadToClient(leadId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const lead = await prisma.client.findUnique({
    where: { id: leadId },
  });

  if (!lead || lead.orgId !== selectedOrgId) {
    throw new Error('Lead not found');
  }

  if (lead.clientStatus !== 'LEAD') {
    throw new Error('Client is not a lead');
  }

  // Convert lead to active client (just update status)
  const client = await prisma.client.update({
    where: { id: leadId },
    data: {
      clientStatus: 'ACTIVE',
      leadStatus: 'CONVERTED',
    },
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  return client;
}

/**
 * Delete lead (mark as archived)
 */
export async function deleteLead(leadId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Soft delete: mark as ARCHIVED instead of hard delete
  await prisma.client.update({
    where: {
      id: leadId,
      orgId: selectedOrgId,
    },
    data: {
      clientStatus: 'ARCHIVED',
    },
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  return { success: true };
}
