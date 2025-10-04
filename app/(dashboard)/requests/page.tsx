/**
 * REQUESTS LIST PAGE
 * Route: /requests
 * 
 * Purpose:
 * Display all customer service requests
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { serialize } from "@/lib/serialization";
import { RequestsPageClient } from "./requests-page-client";

export default async function RequestsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get all requests with related data
  const requests = await prisma.request.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { 
        select: { 
          firstName: true,
          lastName: true,
          companyName: true,
          clientStatus: true 
        } 
      },
      property: { select: { address: true } },
      industry: { select: { label: true } },
      serviceType: { select: { label: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize for client component
  const serializedRequests = serialize(requests);

  return <RequestsPageClient requests={serializedRequests} />;
}

