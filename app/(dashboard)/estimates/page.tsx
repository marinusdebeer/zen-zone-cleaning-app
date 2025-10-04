/**
 * ESTIMATES LIST PAGE
 * Route: /estimates
 * 
 * Purpose:
 * - Displays all estimates for the selected organization
 * - Shows estimate status, client, total amount, and actions
 * - Supports filtering and search
 * 
 * Data Fetching:
 * - Fetches all estimates with client and property relations
 * - Orders by creation date (newest first)
 * - Serializes Decimal fields (subtotal, taxAmount, total)
 * 
 * Component:
 * - Renders EstimatesPageClient (client component for interactivity)
 * 
 * Notes:
 * - Table rows clickable (navigate to estimate detail)
 * - Can convert estimates to jobs from detail page
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { serialize } from "@/lib/serialization";
import { EstimatesPageClient } from "./estimates-page-client";
import { calculateFullPricing } from "@/lib/pricing-calculator";

export default async function EstimatesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get estimates with related data and line items
  const estimates = await prisma.estimate.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { select: { firstName: true, lastName: true, companyName: true, clientStatus: true } },
      property: { select: { address: true } },
      convertedJob: { select: { id: true, title: true } },
      lineItems: true, // For calculating totals
    },
    orderBy: { createdAt: 'desc' }
  });

  // Automatically serialize all Decimal fields
  const serializedEstimates = serialize(estimates);

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

  // Calculate total value from line items
  const totalValue = serializedEstimates.reduce((sum, est) => {
    const pricing = calculateFullPricing({
      lineItems: est.lineItems.map((item: any) => ({
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
      })),
      taxRate: Number(est.taxRate),
      depositRequired: est.depositRequired,
      depositType: est.depositType,
      depositValue: est.depositValue ? Number(est.depositValue) : undefined,
    });
    return sum + pricing.total;
  }, 0);

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