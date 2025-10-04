/**
 * CREATE INVOICE PAGE
 * Route: /invoices/new
 * 
 * Purpose:
 * - Create new invoices for completed jobs
 * - Add line items and payment terms
 * - Send invoices to clients
 * 
 * Data Fetching:
 * - Fetches jobs ready for invoicing (via getJobsForInvoicing)
 * - Fetches all clients (via getClientsForInvoicing)
 * 
 * Component:
 * - Renders InvoiceWizard (client component for form)
 * 
 * Business Logic:
 * - Can create invoice from job (pre-populates line items)
 * - Supports manual invoice creation
 * - Calculates tax and totals automatically
 * 
 * Notes:
 * - Invoice linked to job if created from job
 * - Supports multiple line items
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJobsForInvoicing } from "@/server/actions/invoices";
import { prisma } from "@/server/db";
import { getClientDisplayName } from "@/lib/client-utils";
import { InvoiceForm } from "../_components/invoice-form";

export default async function NewInvoicePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Get both jobs and clients for flexible invoice creation
  const jobs = await getJobsForInvoicing(selectedOrgId);

  // Get all active clients for direct invoicing
  const rawClients = await prisma.client.findMany({
    where: { 
      orgId: selectedOrgId,
      clientStatus: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      emails: true,
    },
    orderBy: [
      { companyName: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  // Map clients to include computed name field
  const clients = rawClients.map(c => ({
    id: c.id,
    name: getClientDisplayName(c),
    firstName: c.firstName,
    lastName: c.lastName,
    companyName: c.companyName,
    emails: c.emails,
  }));

  return <InvoiceForm jobs={jobs} clients={clients} orgId={selectedOrgId} />;
}
