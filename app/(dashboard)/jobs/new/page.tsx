/**
 * CREATE JOB PAGE
 * Route: /jobs/new
 * 
 * Purpose:
 * - Create new one-off or recurring jobs
 * - Generate visits automatically based on recurring pattern
 * - Preview visit schedule before creation
 * 
 * Data Fetching:
 * - Fetches all clients with their properties
 * - Fetches team members for assignment
 * 
 * Component:
 * - Renders JobForm (modular form with multiple sections)
 * 
 * Business Logic:
 * - Job type selection (one-off vs recurring)
 * - Visit generation happens server-side on creation
 * - Validates required fields (title, client, start date)
 * 
 * Notes:
 * - Uses modular components from _components folder
 * - Form state managed by useJobForm hook
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { JobForm } from '../_components/job-form';

export default async function NewJobPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ requestId?: string; estimateId?: string; fromEstimate?: string; startTime?: string; endTime?: string }> 
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const params = await searchParams;
  const { requestId, estimateId, fromEstimate, startTime, endTime } = params;

  // Get clients with their properties
  const clients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    include: {
      properties: true,
    },
    orderBy: [
      { companyName: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ]
  });

  // Get team members
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

  // If converting from estimate, fetch estimate data
  let sourceEstimate = null;
  if (fromEstimate) {
    sourceEstimate = await withOrgContext(selectedOrgId, async () => {
      return await prisma.estimate.findUnique({
        where: { id: fromEstimate },
        include: {
          lineItems: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  const serializedEstimate = sourceEstimate ? serialize(sourceEstimate) : null;

  return (
    <JobForm 
      clients={clients} 
      teamMembers={teamMembers} 
      orgId={selectedOrgId}
      sourceEstimate={serializedEstimate}
      initialStartTime={startTime}
      initialEndTime={endTime}
    />
  );
}