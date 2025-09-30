import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
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
      client: { select: { name: true } },
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

  // Serialize Decimal fields
  const serializedJobs = jobs.map(job => ({
    ...job,
    estimatedCost: job.estimatedCost ? Number(job.estimatedCost) : null,
  }));

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