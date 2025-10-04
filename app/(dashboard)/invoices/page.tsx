/**
 * INVOICES LIST PAGE
 * Route: /invoices
 * 
 * Purpose:
 * - Displays all invoices for the selected organization
 * - Shows invoice status, client, amount, and payment status
 * - Supports filtering and search
 * 
 * Data Fetching:
 * - Fetches all invoices with client, job, and payments relations
 * - Orders by invoice date (newest first)
 * - Serializes Decimal fields (subtotal, taxAmount, total, payments)
 * 
 * Component:
 * - Renders InvoicesPageClient (client component for interactivity)
 * 
 * Notes:
 * - Table rows clickable (navigate to invoice detail)
 * - Shows payment status (Paid, Partial, Unpaid, Overdue)
 * - Calculates amount paid and remaining
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { serialize } from "@/lib/serialization";
import { InvoicesPageClient } from "./invoices-page-client";
import { calculateFullPricing } from "@/lib/pricing-calculator";

export default async function InvoicesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get invoices with line items and payments
  const invoices = await prisma.invoice.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { select: { firstName: true, lastName: true, companyName: true } },
      job: { select: { title: true } },
      payments: { select: { amount: true } },
      lineItems: true, // For calculating totals
    },
    orderBy: { createdAt: 'desc' }
  });

  // Automatically serialize all Decimal fields
  const serializedInvoices = serialize(invoices);

  // Get stats by status
  const stats = await prisma.invoice.groupBy({
    by: ['status'],
    where: { orgId: selectedOrgId },
    _count: true,
  });

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate totals from line items
  const totalAmount = serializedInvoices.reduce((sum, inv) => {
    const pricing = calculateFullPricing({
      lineItems: inv.lineItems.map((item: any) => ({
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
      })),
      taxRate: Number(inv.taxRate),
    });
    return sum + pricing.total;
  }, 0);

  const paidAmount = serializedInvoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => {
      const pricing = calculateFullPricing({
        lineItems: inv.lineItems.map((item: any) => ({
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          total: Number(item.total) || 0,
        })),
        taxRate: Number(inv.taxRate),
      });
      return sum + pricing.total;
    }, 0);

  const outstandingAmount = totalAmount - paidAmount;

  return (
    <InvoicesPageClient 
      invoices={serializedInvoices}
      statusCounts={statusCounts}
      stats={{
        total: invoices.length,
        totalAmount,
        paidAmount,
        outstandingAmount,
      }}
    />
  );
}