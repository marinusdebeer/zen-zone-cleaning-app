import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { ArrowLeft, User, FileText, DollarSign, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) return <div>No organization selected</div>;

  const { id } = await params;

  const estimate = await withOrgContext(selectedOrgId, async () => {
    return await prisma.estimate.findUnique({
      where: { id },
      include: {
        lead: true,
        client: true,
        property: true,
        convertedJob: {
          include: {
            visits: true,
            invoices: true,
          },
        },
      },
    });
  });

  if (!estimate) return <div>Estimate not found</div>;

  const customerName = estimate.client?.name || estimate.lead?.name || 'Unknown';
  const customerType = estimate.client ? 'Client' : 'Lead';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/estimates" className="hover:text-brand">Estimates</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{estimate.title}</span>
      </div>

      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{estimate.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                estimate.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                estimate.status === 'Sent' ? 'bg-brand-bg-tertiary text-blue-800' :
                estimate.status === 'Converted' ? 'bg-brand-bg-tertiary text-brand-text' :
                estimate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>{estimate.status}</span>
            </div>
            {estimate.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{estimate.description}</p>
            )}
          </div>
          <Link
            href="/estimates"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Customer Info */}
        <div className="mt-6 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{customerType}</p>
              <Link 
                href={estimate.client ? `/clients/${estimate.client.id}` : '/leads'}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-brand flex items-center"
              >
                {customerName} →
              </Link>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimate Amount</p>
              <p className="text-3xl font-bold text-brand">${estimate.amount.toString()}</p>
            </div>
          </div>
        </div>

        {/* Valid Until */}
        {estimate.validUntil && (
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Valid until: <strong>{new Date(estimate.validUntil).toLocaleDateString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Converted Job */}
      {estimate.convertedJob ? (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Converted to Job</h2>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{estimate.convertedJob.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{estimate.convertedJob.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {estimate.convertedJob.visits.length} visit(s) scheduled
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {estimate.convertedJob.invoices.length} invoice(s)
                  </span>
                </div>
              </div>
              <Link
                href={`/jobs/${estimate.convertedJob.id}`}
                className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand"
              >
                View Job
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        estimate.status === 'Approved' && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Convert</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This estimate has been approved and can be converted to a job
                </p>
              </div>
              <button className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand font-semibold">
                Convert to Job →
              </button>
            </div>
          </div>
        )
      )}

      {/* Actions */}
      {estimate.status === 'Draft' && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand">
              Send to {customerType}
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)]">
              Edit Estimate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
