/**
 * EDIT INVOICE PAGE
 * Route: /invoices/[id]/edit
 * 
 * Purpose:
 * Edit an existing invoice
 * 
 * Data Fetching:
 * - Fetches invoice by ID with line items
 * - Fetches related job and client data
 * 
 * Component:
 * - Renders InvoiceForm with existing invoice data
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { InvoiceForm } from "../../_components/invoice-form";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch the invoice with relations
  const invoice = await withOrgContext(selectedOrgId, async () => {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        lineItems: {
          orderBy: { order: 'asc' },
        },
      },
    });
  });

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  // Serialize for client component
  const serializedInvoice = serialize(invoice);

  return (
    <InvoiceForm 
      orgId={selectedOrgId}
      existingInvoice={serializedInvoice}
    />
  );
}

