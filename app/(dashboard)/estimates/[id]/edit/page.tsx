/**
 * EDIT ESTIMATE PAGE
 * Route: /estimates/[id]/edit
 * 
 * Purpose:
 * Edit an existing estimate (quote)
 * 
 * Data Fetching:
 * - Fetches estimate by ID
 * - Fetches all clients with properties
 * - Fetches all leads with emails
 * 
 * Component:
 * - Renders EstimateForm with existing estimate data
 * 
 * Notes:
 * - Uses same EstimateForm component as new page
 * - Pre-populates form with existing estimate data
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { EstimateForm } from "../../_components/estimate-form";

export default async function EditEstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch the estimate with line items
  const estimate = await withOrgContext(selectedOrgId, async () => {
    return await prisma.estimate.findUnique({
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

  if (!estimate) {
    return <div>Estimate not found</div>;
  }

  // Fetch all clients (both active and leads) with properties
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

  // Separate leads from active clients for the form
  const clients = allClients.filter(c => c.clientStatus === 'ACTIVE');
  
  // Format leads to match expected interface
  const leads = allClients
    .filter(c => c.clientStatus === 'LEAD')
    .map(c => ({
      id: c.id,
      name: c.name,
      emails: Array.isArray(c.emails) ? c.emails as string[] : [],
    }));

  // Automatically serialize all Decimal fields (pricing, line items, etc.)
  const serialized = serialize(estimate);
  const serializedEstimate = {
    ...serialized,
    clientId: serialized.clientId || '', // Ensure clientId is never null from serialized
    amount: serialized.total, // Map total to amount for form compatibility (already a number after serialize)
  };

  return (
    <EstimateForm 
      clients={clients}
      leads={leads}
      orgId={selectedOrgId}
      existingEstimate={serializedEstimate}
    />
  );
}

