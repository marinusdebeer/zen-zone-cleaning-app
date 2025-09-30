import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJobsForInvoicing, getClientsForInvoicing } from "@/server/actions/invoices";
import { InvoiceWizard } from './invoice-wizard';

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
  const [jobs, clients] = await Promise.all([
    getJobsForInvoicing(selectedOrgId),
    getClientsForInvoicing(selectedOrgId)
  ]);

  return <InvoiceWizard jobs={jobs} clients={clients} orgId={selectedOrgId} />;
}
