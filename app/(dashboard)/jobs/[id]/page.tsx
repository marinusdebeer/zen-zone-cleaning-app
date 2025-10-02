import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { 
  ArrowLeft, User, MapPin, Calendar, Clock, FileText, 
  Repeat, DollarSign, AlertCircle, CheckCircle, Receipt 
} from 'lucide-react';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) return <div>No organization selected</div>;

  const { id } = await params;

  const job = await withOrgContext(selectedOrgId, async () => {
    return await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        convertedFromEstimate: true,
        visits: { orderBy: { scheduledAt: 'asc' } },
        lineItems: true,
        invoices: { include: { payments: true } },
      },
    });
  });

  if (!job) return <div>Job not found</div>;

  const completedVisits = job.visits.filter(v => v.status === 'Completed');
  const upcomingVisits = job.visits.filter(v => v.status === 'Scheduled' || v.status === 'InProgress');

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/jobs" className="hover:text-brand">Jobs</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{job.title}</span>
      </div>

      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              {job.isRecurring && (
                <span className="flex items-center px-3 py-1 bg-brand-bg-tertiary text-brand-text rounded-full text-sm font-medium">
                  <Repeat className="w-4 h-4 mr-1" />
                  Recurring
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                job.status === 'Completed' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                job.status === 'Draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>{job.status}</span>
            </div>
            {job.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{job.description}</p>
            )}
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Key Info Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Client</p>
            <Link href={`/clients/${job.client.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand">
              {job.client.name} →
            </Link>
          </div>
          {job.property && (
            <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Property</p>
              <p className="font-semibold text-gray-900 dark:text-white">{job.property.address}</p>
            </div>
          )}
          {job.estimatedCost && (
            <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Cost</p>
              <p className="font-semibold text-brand">${job.estimatedCost.toString()}</p>
            </div>
          )}
          <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Priority</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{job.priority}</p>
          </div>
        </div>

        {/* Converted from Estimate */}
        {job.convertedFromEstimate && (
          <div className="mt-4 p-4 bg-brand-bg-tertiary border-l-4 border-brand rounded-lg">
            <p className="text-sm text-brand-text">
              <strong>Converted from Estimate:</strong> {job.convertedFromEstimate.title} (${job.convertedFromEstimate.amount.toString()})
              <Link href={`/estimates/${job.convertedFromEstimate.id}`} className="ml-2 underline hover:text-brand-dark">
                View Estimate →
              </Link>
            </p>
          </div>
        )}

        {/* Recurring Info */}
        {job.isRecurring && (
          <div className="mt-4 p-4 bg-brand-bg-tertiary border-l-4 border-brand rounded-lg">
            <p className="text-sm text-brand-text">
              <strong>Recurring Pattern:</strong> {job.recurringPattern}
              {job.recurringDays && Array.isArray(job.recurringDays) && (
                <span> on {(job.recurringDays as number[]).map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</span>
              )}
              {job.recurringEndDate && <span> until {new Date(job.recurringEndDate).toLocaleDateString()}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-brand" />
          Line Items ({job.lineItems.length})
        </h2>
        {job.lineItems.length > 0 ? (
          <table className="w-full">
            <thead className="bg-brand-bg-secondary dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Item</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {job.lineItems.map(item => (
                <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">${item.unitPrice.toString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    ${(parseFloat(item.unitPrice.toString()) * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No line items yet</p>
        )}
      </div>

      {/* Visits */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-brand" />
          Visits ({job.visits.length})
        </h2>
        
        {upcomingVisits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming Visits</h3>
            <div className="space-y-3">
              {upcomingVisits.map(visit => (
                <div key={visit.id} className="p-4 border-2 border-brand bg-brand-bg-tertiary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-brand" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(visit.scheduledAt).toLocaleString()}
                        </p>
                        {visit.isManual && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">Manual</span>
                        )}
                      </div>
                      {visit.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{visit.notes}</p>}
                      {Array.isArray(visit.assignees) && (visit.assignees as string[]).length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Team: {(visit.assignees as string[]).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      visit.status === 'InProgress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300'
                    }`}>{visit.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedVisits.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Completed Visits</h3>
            <div className="space-y-3">
              {completedVisits.map(visit => (
                <div key={visit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(visit.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      {visit.completedAt && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Completed: {new Date(visit.completedAt).toLocaleString()}
                        </p>
                      )}
                      {visit.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{visit.notes}</p>}
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {job.visits.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No visits scheduled yet</p>
        )}
      </div>

      {/* Invoices for this Job */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-brand" />
          Invoices ({job.invoices.length})
        </h2>
        {job.invoices.length > 0 ? (
          <div className="space-y-3">
            {job.invoices.map(invoice => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Invoice #{invoice.id.slice(0, 8)}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-lg text-brand font-bold">${invoice.total.toString()}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        invoice.status === 'Sent' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>{invoice.status}</span>
                      {invoice.payments.length > 0 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {invoice.payments.length} payment(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-brand text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No invoices generated yet</p>
            {completedVisits.length > 0 && (
              <Link
                href={`/invoices/new?jobId=${job.id}`}
                className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand"
              >
                Generate Invoice
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
