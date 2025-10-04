/**
 * NEW ESTIMATE PAGE
 * Route: /estimates/new
 * 
 * Purpose:
 * Create a new estimate (quote) for a client or lead
 * 
 * Data Fetching:
 * - Fetches all clients with properties
 * - Fetches all leads with emails
 * 
 * Component:
 * - Renders EstimateForm (unified create/edit component)
 * 
 * Notes:
 * - Uses modular component architecture
 * - Same form handles both create and edit modes
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { getClientDisplayName } from "@/lib/client-utils";
import { EstimateForm } from "../_components/estimate-form";

export default async function NewEstimatePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ requestId?: string }> 
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
  const requestId = params.requestId;

  // Fetch all clients (both active and leads)
  const allClients = await prisma.client.findMany({
    where: { 
      orgId: selectedOrgId,
      clientStatus: { in: ['LEAD', 'ACTIVE'] },
    },
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

  // Separate active clients and leads
  const clients = allClients.filter(c => c.clientStatus === 'ACTIVE').map(c => ({
    id: c.id,
    name: getClientDisplayName(c),
    properties: c.properties,
  }));
  const leads = allClients.filter(c => c.clientStatus === 'LEAD').map(c => ({
    id: c.id,
    name: getClientDisplayName(c),
    emails: (c.emails as any)?.length ? c.emails as string[] : [],
    properties: c.properties,
  }));

  // If converting from request, fetch and pre-populate
  let fromRequest = null;
  if (requestId) {
    const request = await withOrgContext(selectedOrgId, async () => {
      return await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          client: true,
          property: true,
        },
      });
    });

    if (request) {
      fromRequest = serialize({
        clientId: request.clientId,
        propertyId: request.propertyId,
        title: request.title,
        description: request.description,
      });
    }
  }

  return (
    <EstimateForm 
      clients={clients}
      leads={leads}
      orgId={selectedOrgId}
      fromRequest={fromRequest}
    />
  );
}
