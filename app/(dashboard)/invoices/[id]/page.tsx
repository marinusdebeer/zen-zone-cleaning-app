/**
 * INVOICE DETAIL PAGE
 * Route: /invoices/[id]
 * 
 * Purpose:
 * - Display invoice details and payment history
 * - Show line items and pricing breakdown
 * - Record payments
 * 
 * Data Fetching:
 * - Fetches invoice with client, job, lineItems, payments
 * - Serializes Decimal fields for client rendering
 * - Calculates amount paid and remaining
 * 
 * Component:
 * - Server component (static invoice display)
 * 
 * Business Logic:
 * - Tracks payment status (Paid, Partial, Unpaid, Overdue)
 * - Shows link to associated job if exists
 * - Displays payment history
 * 
 * Notes:
 * - Shows amount paid, amount remaining
 * - Links to related job and client
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { 
  User, Receipt, Calendar, DollarSign, 
  CreditCard, CheckCircle, Clock, FileText, ArrowRight
} from 'lucide-react';
import { InvoiceActions } from './invoice-actions';
import { calculateFullPricing } from '@/lib/pricing-calculator';
import { getClientDisplayName } from '@/lib/client-utils';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) return <div>No organization selected</div>;

  const { id } = await params;

  const invoice = await withOrgContext(selectedOrgId, async () => {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        job: {
          include: {
            lineItems: true,
            convertedFromEstimate: true,
          },
        },
        visits: true,
        lineItems: true, // Invoice line items for pricing calculation
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
  });

  if (!invoice) return <div>Invoice not found</div>;

  // Calculate pricing from line items
  const pricing = calculateFullPricing({
    lineItems: (invoice.lineItems || []).map((item: any) => ({
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    taxRate: Number(invoice.taxRate),
  });

  const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const balance = pricing.total - totalPaid;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/invoices" className="hover:text-brand">Invoices</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Invoice #{invoice.id.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice #{invoice.id.slice(0, 8)}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                invoice.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                invoice.status === 'Sent' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>{invoice.status}</span>
            </div>
          </div>
          <InvoiceActions 
            invoiceId={invoice.id}
            status={invoice.status}
          />
        </div>

        {/* Invoice Details Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client */}
          <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <User className="w-3 h-3 mr-1" />
              Client
            </p>
            <Link href={`/clients/${invoice.client.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand text-lg">
              {getClientDisplayName(invoice.client)} →
            </Link>
          </div>

          {/* Job */}
          {invoice.job && (
            <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Related Job
              </p>
              <Link href={`/jobs/${invoice.job.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand text-lg">
                {invoice.job.title || getClientDisplayName(invoice.job.client)} →
              </Link>
            </div>
          )}

          {/* Dates */}
          <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Issued
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'Not issued'}
            </p>
          </div>

          <div className="p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Due Date
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Estimate Chain */}
      {invoice.job?.convertedFromEstimate && (
        <div className="bg-brand-bg-tertiary border-2 border-brand rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conversion Trail</h3>
          <div className="flex items-center space-x-3 text-sm">
            <Link href={`/estimates/${invoice.job.convertedFromEstimate.id}`} className="px-3 py-2 bg-brand-bg border border-brand rounded-lg hover:bg-[var(--tenant-bg-tertiary)]">
              📋 Estimate: {invoice.job.convertedFromEstimate.title}
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link href={`/jobs/${invoice.job.id}`} className="px-3 py-2 bg-brand-bg border border-brand rounded-lg hover:bg-[var(--tenant-bg-tertiary)]">
              💼 Job: {invoice.job.title || getClientDisplayName(invoice.job.client)}
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
              🧾 Invoice (Current)
            </div>
          </div>
        </div>
      )}

      {/* Visits Included */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visits Included ({invoice.visits.length})</h2>
        {invoice.visits.length > 0 ? (
          <div className="space-y-3">
            {invoice.visits.map(visit => (
              <div key={visit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(visit.scheduledAt).toLocaleString()}
                    </p>
                    {visit.completedAt && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Completed: {new Date(visit.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    visit.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>{visit.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No visits linked to this invoice</p>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Line Items</h2>
        <table className="w-full">
          <thead className="bg-brand-bg-secondary dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Qty</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item: any) => (
              <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">{Number(item.quantity)}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">${item.unitPrice.toString()}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                  ${item.total.toString()}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300">
              <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">Subtotal:</td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">${pricing.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">Tax ({pricing.taxRate}%):</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">${pricing.taxAmount.toFixed(2)}</td>
            </tr>
            <tr className="border-t-2 border-gray-300 bg-brand-bg-secondary dark:bg-gray-700">
              <td colSpan={3} className="px-4 py-3 text-lg font-bold text-gray-900 dark:text-white text-right">Total:</td>
              <td className="px-4 py-3 text-lg font-bold text-brand text-right">${pricing.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payments */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-brand" />
          Payments ({invoice.payments.length})
        </h2>
        {invoice.payments.length > 0 ? (
          <div className="space-y-3">
            {invoice.payments.map(payment => (
              <div key={payment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="font-medium text-gray-900 dark:text-white">${payment.amount.toString()}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {payment.method.replace('_', ' ')} 
                      {payment.reference && ` - ${payment.reference}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Paid: {new Date(payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Payment Summary */}
            <div className="mt-4 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg border-2 border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Paid:</span>
                <span className="text-lg font-bold text-green-600">${totalPaid.toFixed(2)}</span>
              </div>
              {balance > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Balance Due:</span>
                  <span className="text-lg font-bold text-red-600">${balance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No payments recorded</p>
            {invoice.status !== 'Paid' && (
              <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand">
                Record Payment
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
