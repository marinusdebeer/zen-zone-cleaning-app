import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { getInvoices } from '@/server/actions/invoices';

export default async function InvoicesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const invoices = await getInvoices(selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create invoices from completed jobs
              </p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Invoice #{invoice.id.slice(0, 8)}
                      </h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Client:</strong> {invoice.client?.name}
                        </p>
                        {invoice.job && (
                          <p className="text-sm text-gray-600">
                            <strong>Job:</strong> {invoice.job.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> ${invoice.total.toString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Status:</strong> {invoice.status}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}