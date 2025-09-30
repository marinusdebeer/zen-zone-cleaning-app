import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { EstimatesPageClient } from "./estimates-page-client";

export default async function EstimatesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get estimates with related data
  const estimates = await prisma.estimate.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { select: { name: true } },
      lead: { select: { name: true } },
      property: { select: { address: true } },
      convertedJob: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Serialize Decimals
  const serializedEstimates = estimates.map(est => ({
    ...est,
    amount: Number(est.amount),
  }));

  // Get stats by status
  const stats = await prisma.estimate.groupBy({
    by: ['status'],
    where: { orgId: selectedOrgId },
    _count: true,
  });

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total value
  const totalValue = estimates.reduce((sum, est) => sum + Number(est.amount), 0);

  return (
    <EstimatesPageClient 
      estimates={serializedEstimates}
      statusCounts={statusCounts}
      stats={{
        total: estimates.length,
        totalValue,
      }}
    />
  );
}