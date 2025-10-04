/**
 * PAYMENTS LIST PAGE
 * Route: /payments
 * 
 * Purpose:
 * - Display all payments received
 * - Record new payments against invoices
 * - Track payment methods and dates
 * 
 * Data Fetching:
 * - Fetches all payments via getPayments() action
 * - Fetches unpaid invoices via getUnpaidInvoices()
 * - Includes invoice and client relations
 * 
 * Component:
 * - Renders PaymentsClient (client component for recording payments)
 * 
 * Features:
 * - Payment method tracking (Cash, Check, Card, Bank Transfer)
 * - Links payments to invoices
 * - Shows payment history
 * 
 * Notes:
 * - Serializes Decimal amounts for client
 * - Updates invoice payment status automatically
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPayments, getUnpaidInvoices } from "@/server/actions/payments";
import { serialize } from "@/lib/serialization";
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

  // Automatically serialize all Decimal fields
  const serializedPayments = serialize(payments);
  const serializedUnpaidInvoices = serialize(unpaidInvoices);

  return <PaymentsClient payments={serializedPayments} unpaidInvoices={serializedUnpaidInvoices} />;
}