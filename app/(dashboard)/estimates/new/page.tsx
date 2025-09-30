import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { EstimateWizard } from './estimate-wizard';

export default async function NewEstimatePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get clients with their properties
  const clients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    include: {
      properties: true,
    },
    orderBy: { name: 'asc' }
  });

  // Get leads
  const leads = await prisma.lead.findMany({
    where: { 
      orgId: selectedOrgId,
      status: { not: 'CONVERTED' }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <EstimateWizard
      clients={clients}
      leads={leads}
      orgId={selectedOrgId}
    />
  );
}
