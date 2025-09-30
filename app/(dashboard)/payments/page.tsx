import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPayments, getUnpaidInvoices } from "@/server/actions/payments";
import { PaymentsClient } from "./payments-client";

export default async function PaymentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const [payments, unpaidInvoices] = await Promise.all([
    getPayments(),
    getUnpaidInvoices()
  ]);

  // Convert Decimal to number for client component
  const serializedPayments = payments.map(p => ({
    ...p,
    amount: Number(p.amount),
    invoice: {
      ...p.invoice,
      subtotal: Number(p.invoice.subtotal),
      taxAmount: Number(p.invoice.taxAmount),
      total: Number(p.invoice.total),
    }
  }));

  const serializedUnpaidInvoices = unpaidInvoices.map(inv => ({
    ...inv,
    subtotal: Number(inv.subtotal),
    taxAmount: Number(inv.taxAmount),
    total: Number(inv.total),
    payments: inv.payments.map(p => ({
      ...p,
      amount: Number(p.amount)
    }))
  }));

  return <PaymentsClient payments={serializedPayments} unpaidInvoices={serializedUnpaidInvoices} />;
}