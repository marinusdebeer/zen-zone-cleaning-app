'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';

export async function globalSearch(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm || searchTerm.length < 2) {
    return {
      clients: [],
      jobs: [],
      invoices: [],
      estimates: [],
      leads: [],
      properties: [],
      payments: [],
    };
  }

  // Get all clients first to search in JSON fields
  const allClients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    select: {
      id: true,
      name: true,
      emails: true,
      phones: true,
      addresses: true,
      createdAt: true,
    },
  });

  // Filter clients by name, email, phone, or address
  const clients = allClients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(searchTerm);
    const emails = Array.isArray(client.emails) ? client.emails : [];
    const phones = Array.isArray(client.phones) ? client.phones : [];
    const addresses = Array.isArray(client.addresses) ? client.addresses : [];
    
    const emailMatch = emails.some((e: any) => typeof e === 'string' && e.toLowerCase().includes(searchTerm));
    const phoneMatch = phones.some((p: any) => typeof p === 'string' && p.toLowerCase().includes(searchTerm));
    const addressMatch = addresses.some((a: any) => typeof a === 'string' && a.toLowerCase().includes(searchTerm));
    
    return nameMatch || emailMatch || phoneMatch || addressMatch;
  }).slice(0, 5);

  // Search across all other entities in parallel
  const [jobs, invoices, estimates, leads, properties, payments] = await Promise.all([

    // Search jobs
    prisma.job.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        client: { select: { name: true } },
      },
      take: 5,
    }),

    // Search invoices (by client name or job title)
    prisma.invoice.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { job: { title: { contains: searchTerm, mode: 'insensitive' } } },
        ]
      },
      include: {
        client: { select: { name: true } },
        job: { select: { title: true } },
      },
      take: 5,
    }).then(invs => invs.map(inv => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      total: Number(inv.total),
    }))),

    // Search estimates
    prisma.estimate.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        client: { select: { name: true } },
        lead: { select: { name: true } },
      },
      take: 5,
    }).then(ests => ests.map(est => ({
      ...est,
      amount: Number(est.amount),
    }))),

    // Search leads
    prisma.lead.findMany({
      where: {
        orgId: selectedOrgId,
        name: { contains: searchTerm, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        emails: true,
        phones: true,
        status: true,
        createdAt: true,
      },
      take: 5,
    }),

    // Search properties
    prisma.property.findMany({
      where: {
        orgId: selectedOrgId,
        address: { contains: searchTerm, mode: 'insensitive' }
      },
      include: {
        client: { select: { name: true } },
      },
      take: 5,
    }),

    // Search payments (by client name or reference)
    prisma.payment.findMany({
      where: {
        orgId: selectedOrgId,
        OR: [
          { invoice: { client: { name: { contains: searchTerm, mode: 'insensitive' } } } },
          { reference: { contains: searchTerm, mode: 'insensitive' } },
        ]
      },
      include: {
        invoice: {
          include: {
            client: { select: { name: true } },
          }
        }
      },
      take: 5,
    }).then(payments => payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      invoice: {
        ...p.invoice,
        subtotal: Number(p.invoice.subtotal),
        taxAmount: Number(p.invoice.taxAmount),
        total: Number(p.invoice.total),
      }
    }))),
  ]);

  return {
    clients,
    jobs,
    invoices,
    estimates,
    leads,
    properties,
    payments,
  };
}
