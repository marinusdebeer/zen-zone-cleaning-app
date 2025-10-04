/**
 * NEW REQUEST PAGE
 * Route: /requests/new
 * 
 * Purpose:
 * Create a new customer service request
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { RequestFormEnhanced } from "../_components/request-form-enhanced";

export default async function NewRequestPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
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
  const [industries, hearAboutOptions] = await Promise.all([
    prisma.industry.findMany({
      where: { active: true },
      include: {
        serviceTypes: {
          where: { active: true },
          orderBy: { label: 'asc' },
        },
      },
      orderBy: { label: 'asc' },
    }),
    prisma.hearAbout.findMany({
      where: { active: true },
      orderBy: { label: 'asc' },
    }),
  ]);

  return (
    <RequestFormEnhanced 
      clients={clients} 
      orgId={selectedOrgId}
      industries={industries}
      hearAboutOptions={hearAboutOptions}
    />
  );
}

