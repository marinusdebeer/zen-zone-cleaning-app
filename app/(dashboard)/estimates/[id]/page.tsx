/**
 * ESTIMATE DETAIL PAGE
 * Route: /estimates/[id]
 * 
 * Purpose:
 * - Display estimate details and line items
 * - Show pricing breakdown (subtotal, tax, total)
 * - Allow conversion to job
 * 
 * Data Fetching:
 * - Fetches estimate with client, property, lineItems
 * - Serializes Decimal fields for client rendering
 * 
 * Component:
 * - Server component (static estimate display)
 * 
 * Business Logic:
 * - Can convert estimate to job (creates new job record)
 * - Shows status (Draft, Sent, Approved, Declined)
 * 
 * Notes:
 * - Line items show quantity, unit price, total
 * - Auto-calculates tax and total
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { User, FileText, DollarSign, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { EstimateActions } from './estimate-actions';
import { calculateFullPricing } from '@/lib/pricing-calculator';
import { getClientDisplayName } from '@/lib/client-utils';

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
        client: true,
        property: true,
        lineItems: {
          orderBy: { order: 'asc' },
        },
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

  // Calculate pricing from line items
  const pricing = calculateFullPricing({
    lineItems: estimate.lineItems.map(item => ({
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    taxRate: Number(estimate.taxRate),
    depositRequired: estimate.depositRequired,
    depositType: estimate.depositType,
    depositValue: estimate.depositValue ? Number(estimate.depositValue) : undefined,
  });

  const customerName = estimate.client ? getClientDisplayName(estimate.client) : 'Unknown';
  const customerType = estimate.client?.clientStatus === 'LEAD' ? 'Lead' : 'Client';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/estimates" className="hover:text-brand">Estimates</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {estimate.title || (estimate.client ? getClientDisplayName(estimate.client) : 'Untitled Estimate')}
        </span>
      </div>

      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {estimate.title || (estimate.client ? getClientDisplayName(estimate.client) : 'Untitled Estimate')}
              </h1>
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
          <EstimateActions 
            estimateId={estimate.id}
            status={estimate.status}
            convertedToJobId={estimate.convertedToJobId}
            clientName={estimate.client ? getClientDisplayName(estimate.client) : 'Unknown'}
            clientEmail={Array.isArray(estimate.client?.emails) && estimate.client.emails.length > 0 
              ? (estimate.client.emails[0] as string)
              : ''}
            clientPhone={Array.isArray(estimate.client?.phones) && estimate.client.phones.length > 0 
              ? (estimate.client.phones[0] as string)
              : ''}
            estimateTitle={estimate.title || (estimate.client ? getClientDisplayName(estimate.client) : 'Untitled Estimate')}
            estimateTotal={pricing.total}
          />
        </div>

        {/* Customer Info */}
        <div className="mt-6 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Client</p>
              <Link 
                href={`/clients/${estimate.client.id}`}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-brand flex items-center gap-2"
              >
                {customerName}
                {estimate.client?.clientStatus === 'LEAD' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                    Lead
                  </span>
                )}
                <span>→</span>
              </Link>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-3xl font-bold text-brand">${pricing.total.toFixed(2)}</p>
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
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Converted to Job</h2>
          </div>
          
          <div className="bg-brand-bg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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
                className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                View Job
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        estimate.status === 'Approved' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 dark:border-yellow-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Convert</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This estimate has been approved and can be converted to a job
                </p>
              </div>
              <button className="px-6 py-3 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                Convert to Job →
              </button>
            </div>
          </div>
        )
      )}

      {/* Line Items */}
      {estimate.lineItems.length > 0 && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Item</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {estimate.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      )}
                    </td>
                    <td className="text-right text-gray-900 dark:text-white">{item.quantity.toString()}</td>
                    <td className="text-right text-gray-900 dark:text-white">${item.unitPrice.toString()}</td>
                    <td className="text-right font-semibold text-gray-900 dark:text-white">${item.total.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown - Calculated from line items */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax ({pricing.taxRate}%)</span>
                <span className="text-gray-900 dark:text-white">${pricing.taxAmount.toFixed(2)}</span>
              </div>
            )}
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Discount</span>
                <span className="text-red-600 dark:text-red-400">-${pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-brand">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-brand">${pricing.total.toFixed(2)}</span>
            </div>
            {pricing.depositRequired && pricing.depositAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-2">
                <span>Deposit Required</span>
                <span className="font-semibold">${pricing.depositAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
