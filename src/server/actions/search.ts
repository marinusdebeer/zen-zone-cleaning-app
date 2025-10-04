/**
 * GLOBAL SEARCH SERVER ACTIONS
 * 
 * Purpose:
 * Server-side search functionality across all entities.
 * Powers the global search bar in the header.
 * 
 * Functions:
 * - globalSearch: Search across clients, jobs, invoices, estimates
 * 
 * Business Logic:
 * - Searches multiple models simultaneously
 * - Returns results grouped by type
 * - Limits results per category
 * - Case-insensitive search
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 179 lines ✅
 */

'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { serialize } from '@/lib/serialization';

export async function globalSearch(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm || searchTerm.length < 2) {
    return {
      clients: [],
      requests: [],
      estimates: [],
      jobs: [],
      invoices: [],
      properties: [],
      payments: [],
    };
  }

  // Get all clients first to search in JSON fields
  const allClients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      emails: true,
      phones: true,
      addresses: true,
      clientStatus: true,
      leadStatus: true,
      createdAt: true,
    },
  });

  // Filter clients by name, email, phone, or address
  const clients = allClients.filter(client => {
    const firstNameMatch = (client.firstName || '').toLowerCase().includes(searchTerm);
    const lastNameMatch = (client.lastName || '').toLowerCase().includes(searchTerm);
    const companyNameMatch = (client.companyName || '').toLowerCase().includes(searchTerm);
    const emails = Array.isArray(client.emails) ? client.emails : [];
    const phones = Array.isArray(client.phones) ? client.phones : [];
    const addresses = Array.isArray(client.addresses) ? client.addresses : [];
    
    const emailMatch = emails.some((e: any) => typeof e === 'string' && e.toLowerCase().includes(searchTerm));
    const phoneMatch = phones.some((p: any) => typeof p === 'string' && p.toLowerCase().includes(searchTerm));
    const addressMatch = addresses.some((a: any) => typeof a === 'string' && a.toLowerCase().includes(searchTerm));
    
    return firstNameMatch || lastNameMatch || companyNameMatch || emailMatch || phoneMatch || addressMatch;
  }).slice(0, 5);

  // Search across all other entities in parallel
  const [requests, jobs, invoices, estimates, properties, payments] = await Promise.all([

    // Search requests (by title, description, or client name)
    prisma.request.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { firstName: true, lastName: true, companyName: true } },
      },
      take: 5,
    }),

    // Search jobs (by title, description, or client name)
    prisma.job.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { firstName: true, lastName: true, companyName: true } },
      },
      take: 5,
    }),

    // Search invoices (by client name or job title)
    prisma.invoice.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
          { job: { title: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { firstName: true, lastName: true, companyName: true } },
        job: { select: { title: true } },
      },
      take: 5,
    }),

    // Search estimates (by title, description, or client name)
    prisma.estimate.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { firstName: true, lastName: true, companyName: true } },
      },
      take: 5,
    }),

    // Search properties (by address or client name)
    prisma.property.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { firstName: true, lastName: true, companyName: true } },
      },
      take: 5,
    }),

    // Search payments (by client name or reference)
    prisma.payment.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { invoice: { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } } },
          { invoice: { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } } },
          { invoice: { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } } },
          { reference: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        invoice: {
          include: {
            client: { select: { firstName: true, lastName: true, companyName: true } },
          }
        }
      },
      take: 5,
    }),
  ]);

  // Automatically serialize all Decimal fields
  return serialize({
    clients,
    requests,
    estimates,
    jobs,
    invoices,
    properties,
    payments,
  });
}
