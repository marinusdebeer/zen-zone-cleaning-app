/**
 * EDIT REQUEST PAGE
 * Route: /requests/[id]/edit
 * 
 * Purpose:
 * Edit an existing request
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { RequestFormEnhanced } from "../../_components/request-form-enhanced";

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch the request
  const request = await withOrgContext(selectedOrgId, async () => {
    return await prisma.request.findUnique({
      where: { id },
    });
  });

  if (!request) {
    return <div>Request not found</div>;
  }

  // Fetch clients with properties
  const clients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    include: {
      properties: {
        select: {
          id: true,
          address: true,
        },
      },
    },
    orderBy: [
      { companyName: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  // Fetch lookup data for form
  const industries = await prisma.industry.findMany({
    where: { active: true },
    include: {
      serviceTypes: {
        where: { active: true },
        select: { id: true, slug: true, label: true },
        orderBy: { label: 'asc' },
      },
    },
    orderBy: { label: 'asc' },
  });

  const hearAboutOptions = await prisma.hearAbout.findMany({
    where: { active: true },
    orderBy: { label: 'asc' },
  });

  // Serialize for client component
  const serializedRequest = serialize(request);

  return (
    <RequestFormEnhanced 
      clients={clients}
      orgId={selectedOrgId}
      industries={industries}
      hearAboutOptions={hearAboutOptions}
      existingRequest={serializedRequest}
    />
  );
}

