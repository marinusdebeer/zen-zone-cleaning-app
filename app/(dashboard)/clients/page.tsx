import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { ClientsPageClient } from "./clients-page-client";

export default async function ClientsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get clients with additional stats
  const clients = await prisma.client.findMany({
    where: { orgId: selectedOrgId },
    include: {
      _count: {
        select: {
          properties: true,
          jobs: true,
          invoices: true,
          estimates: true,
        }
      },
      convertedFromLead: {
        select: {
          source: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, newClientsThisMonth, activeClients] = await Promise.all([
    prisma.client.count({ where: { orgId: selectedOrgId } }),
    prisma.client.count({ 
      where: { 
        orgId: selectedOrgId,
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.client.count({
      where: {
        orgId: selectedOrgId,
        jobs: {
          some: {
            createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) }
          }
        }
      }
    })
  ]);

  return (
    <ClientsPageClient 
      clients={clients} 
      stats={{
        total: totalClients,
        newThisMonth: newClientsThisMonth,
        active: activeClients
      }}
      orgId={selectedOrgId}
    />
  );
}