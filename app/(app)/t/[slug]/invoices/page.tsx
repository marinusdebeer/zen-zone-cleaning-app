import Link from 'next/link';
import { getOrgBySlug } from '@/server/tenancy';
import { getInvoices } from '@/server/actions/invoices';

interface InvoicesPageProps {
  params: Promise<{ slug: string }>;
}

function formatCurrency(amount: any) {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

function formatDate(date: Date | null) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function InvoicesPage({ params }: InvoicesPageProps) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) {
    return <div>Organization not found</div>;
  }

  const invoices = await getInvoices(org.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link
          href={`/t/${slug}/jobs`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Create from Job
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete jobs to create invoices
              </p>
              <Link
                href={`/t/${slug}/jobs`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          Invoice #{invoice.id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Client:</strong> {invoice.client.name}
                        </p>
                        
                        <p className="text-sm text-gray-600">
                          <strong>Job:</strong> {invoice.job.title}
                        </p>
                        
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> <span className="font-semibold text-green-600">{formatCurrency(invoice.total)}</span>
                        </p>
                        
                        <div className="flex space-x-4">
                          <p className="text-sm text-gray-600">
                            <strong>Issued:</strong> {formatDate(invoice.issuedAt)}
                          </p>
                          
                          {invoice.dueAt && (
                            <p className="text-sm text-gray-600">
                              <strong>Due:</strong> {formatDate(invoice.dueAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        href={`/t/${slug}/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Invoices</h3>
            <p className="text-3xl font-bold text-blue-600">{invoices.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Value</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.total), 0))}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Paid Invoices</h3>
            <p className="text-3xl font-bold text-green-600">
              {invoices.filter(inv => inv.status === 'Paid').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
