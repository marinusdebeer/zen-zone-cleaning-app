/**
 * EDIT JOB PAGE
 * Route: /jobs/[id]/edit
 * 
 * Purpose:
 * - Edit existing job details
 * - Update scheduling, billing, and other settings
 * - Reuses same form as job creation for consistency
 * 
 * Data Fetching:
 * - Fetches job to edit (with client and property)
 * - Fetches all clients with properties (for dropdown)
 * - Fetches team members (though not editable in edit mode)
 * - Serializes Decimal fields to strings
 * 
 * Component:
 * - Renders JobForm with existingJob prop (triggers edit mode)
 * 
 * Business Logic:
 * - Job type is LOCKED (cannot change one-off ↔ recurring)
 * - Editing recurring settings does NOT regenerate visits
 * - Individual visits must be edited on detail page
 * - Calls updateJob server action instead of createJob
 * 
 * Notes:
 * - Same UI as create page for consistency
 * - Visit preview hidden in edit mode
 * - Warning shown about not affecting existing visits
 * - Redirects to job detail page on success
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { JobForm } from '../../_components/job-form';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
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
        lineItems: {
          orderBy: { order: 'asc' },
        },
      },
    });
  });

  if (!job) return <div>Job not found</div>;

  // Get all clients with their properties
  const clients = await prisma.client.findMany({
    where: { 
      orgId: selectedOrgId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      clientStatus: true,
      properties: {
        select: {
          id: true,
          address: true,
        }
      }
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

  // Automatically serialize all Decimal fields
  const serializedJob = serialize(job);

  return (
    <JobForm 
      clients={clients} 
      teamMembers={teamMembers} 
      orgId={selectedOrgId}
      existingJob={serializedJob}
    />
  );
}

