/**
 * JOBS LIST PAGE
 * Route: /jobs
 * 
 * Purpose:
 * - Displays all jobs for the selected organization
 * - Shows job status, client, next visit, and actions
 * - Supports filtering and search
 * 
 * Data Fetching:
 * - Fetches all jobs with client, property, and visits relations
 * - Orders by creation date (newest first)
 * 
 * Component:
 * - Renders JobsPageClient (client component for interactivity)
 * 
 * Notes:
 * - Jobs table is clickable (entire row navigates to detail)
 * - Shows next upcoming visit for each job
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { serialize } from "@/lib/serialization";
import { JobsPageClient } from "./jobs-page-client";

export default async function JobsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get jobs with related data
  const jobs = await prisma.job.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { select: { firstName: true, lastName: true, companyName: true } },
      property: { select: { address: true } },
      visits: {
        select: {
          id: true,
          scheduledAt: true,
          status: true,
        },
        orderBy: { scheduledAt: 'asc' }
      },
      _count: {
        select: {
          visits: true,
          invoices: true,
          lineItems: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Automatically serialize all Decimal fields
  const serializedJobs = serialize(jobs);

  // Get stats
  const stats = await prisma.job.groupBy({
    by: ['status'],
    where: { orgId: selectedOrgId },
    _count: true,
  });

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <JobsPageClient 
      jobs={serializedJobs} 
      statusCounts={statusCounts}
      orgId={selectedOrgId}
    />
  );
}