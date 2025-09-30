import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { InvoicesPageClient } from "./invoices-page-client";

export default async function InvoicesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get invoices with stats
  const invoices = await prisma.invoice.findMany({
    where: { orgId: selectedOrgId },
    include: {
      client: { select: { name: true } },
      job: { select: { title: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Serialize Decimals
  const serializedInvoices = invoices.map(inv => ({
    ...inv,
    subtotal: Number(inv.subtotal),
    taxAmount: Number(inv.taxAmount),
    total: Number(inv.total),
    payments: inv.payments.map(p => ({ amount: Number(p.amount) }))
  }));

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

  // Calculate totals
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const paidAmount = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.total), 0);
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