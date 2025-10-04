/**
 * JOB DETAIL PAGE
 * Route: /jobs/[id]
 * 
 * Purpose:
 * - Display comprehensive job information
 * - Show all visits (sorted: upcoming first, completed last)
 * - Display line items, expenses, and invoices
 * - Allow inline editing of individual visits
 * 
 * Data Fetching:
 * - Fetches single job with all relations:
 *   - client, property, visits, lineItems, expenses, invoices
 * - Serializes Decimal fields to strings for client component
 * 
 * Component:
 * - Renders JobDetailClient (client component with visit editing)
 * 
 * Business Logic:
 * - Visit sorting: Non-completed ascending, completed descending
 * - Financial calculations: Line items total, expenses total
 * - Visit status management: Mark complete, reschedule, cancel
 * 
 * Notes:
 * - Visits table has max-height 600px with scroll
 * - Line items and expenses in side-by-side grid (max 300px each)
 * - All Decimal fields converted to strings before passing to client
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { serialize } from '@/lib/serialization';
import { JobDetailClient } from './job-detail-client';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) return <div>No organization selected</div>;

  const { id } = await params;

  const job = await withOrgContext(selectedOrgId, async () => {
    return await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        convertedFromEstimate: true,
        visits: {
          include: {
            lineItems: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
        lineItems: {
          orderBy: { order: 'asc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
        invoices: { include: { payments: true } },
      },
    });
  });

  if (!job) return <div>Job not found</div>;

  // Get team members for worker assignment in visit modal
  const teamMembers = await prisma.membership.findMany({
    where: { orgId: selectedOrgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  // Automatically serialize all Decimal fields
  const serializedJob = serialize(job);

  return <JobDetailClient job={serializedJob} orgId={selectedOrgId} teamMembers={teamMembers} />;
}
