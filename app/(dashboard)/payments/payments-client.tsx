'use client';

import { useState } from 'react';
import {
  DollarSign,
  Plus,
  Calendar,
  CreditCard,
  X,
  CheckCircle,
  XCircle,
  Receipt,
  User,
  Trash2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { recordPayment, deletePayment } from '@/server/actions/payments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  paidAt: Date;
  invoice: {
    id: string;
    total: number;
    client: {
      name: string;
    };
    job: {
      title: string;
    } | null;
  };
}

interface UnpaidInvoice {
  id: string;
  total: number;
  createdAt: Date;
  client: {
    name: string;
  };
  payments: { amount: number }[];
}

interface PaymentsClientProps {
  payments: Payment[];
  unpaidInvoices: UnpaidInvoice[];
}

export function PaymentsClient({ payments: initialPayments, unpaidInvoices }: PaymentsClientProps) {
  const router = useRouter();
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    method: 'CASH',
    reference: '',
    notes: '',
    paidAt: new Date().toISOString().split('T')[0], // Today's date
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await recordPayment({
        invoiceId: paymentForm.invoiceId,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
        paidAt: new Date(paymentForm.paidAt),
      });
      
      showSuccess('Payment recorded successfully!');
      setShowRecordModal(false);
      setPaymentForm({
        invoiceId: '',
        amount: '',
        method: 'CASH',
        reference: '',
        notes: '',
        paidAt: new Date().toISOString().split('T')[0],
      });
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Delete this payment? This action cannot be undone.')) return;

    try {
      await deletePayment(paymentId);
      showSuccess('Payment deleted successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete payment');
    }
  };

  const totalReceived = initialPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + (Number(inv.total) - paid);
  }, 0);

  const selectedInvoice = unpaidInvoices.find(inv => inv.id === paymentForm.invoiceId);
  const invoicePaid = selectedInvoice 
    ? selectedInvoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
  const invoiceRemaining = selectedInvoice 
    ? Number(selectedInvoice.total) - invoicePaid
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-7 h-7 mr-2 text-[#4a7c59]" />
            Payments
          </h1>
          <p className="text-gray-600 mt-1">Track and record all payments received</p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record Payment
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Count</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{initialPayments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments History */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Invoice/Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No payments recorded yet</p>
                  </td>
                </tr>
              ) : (
                initialPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(payment.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{payment.invoice.client.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/invoices/${payment.invoice.id}`}
                        className="text-sm text-[#4a7c59] hover:text-[#4a8c37] flex items-center"
                      >
                        {payment.invoice.job?.title || 'Invoice'}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{payment.reference || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-green-700">
                        ${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-[#4a7c59]" />
                  Record Payment
                </h2>
                <p className="text-sm text-gray-600 mt-1">Add a payment to an invoice</p>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {/* Select Invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                >
                  <option value="">Select an invoice...</option>
                  {unpaidInvoices.map((invoice) => {
                    const paid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
                    const remaining = Number(invoice.total) - paid;
                    return (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.client.name} - ${Number(invoice.total).toFixed(2)} 
                        {paid > 0 ? ` (${remaining.toFixed(2)} remaining)` : ''}
                      </option>
                    );
                  })}
                </select>
                {unpaidInvoices.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No unpaid invoices available</p>
                )}
              </div>

              {/* Invoice Info */}
              {selectedInvoice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Invoice Total</p>
                      <p className="text-blue-900 font-bold">${Number(selectedInvoice.total).toFixed(2)}</p>
                    </div>
                    {invoicePaid > 0 && (
                      <div>
                        <p className="text-blue-700 font-medium">Already Paid</p>
                        <p className="text-blue-900 font-bold">${invoicePaid.toFixed(2)}</p>
                      </div>
                    )}
                    {invoiceRemaining > 0 && (
                      <div className="col-span-2">
                        <p className="text-blue-700 font-medium">Remaining Balance</p>
                        <p className="text-blue-900 font-bold text-lg">${invoiceRemaining.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                    placeholder="0.00"
                  />
                </div>
                {selectedInvoice && paymentForm.amount && parseFloat(paymentForm.amount) > invoiceRemaining && (
                  <p className="mt-1 text-xs text-yellow-600">⚠️ Amount exceeds remaining balance</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="CHECK">📝 Check</option>
                  <option value="CREDIT_CARD">💳 Credit Card</option>
                  <option value="DEBIT_CARD">💳 Debit Card</option>
                  <option value="E-TRANSFER">📱 E-Transfer</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                  <option value="OTHER">📋 Other</option>
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference/Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                  placeholder="Check #, transaction ID, etc."
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paidAt}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  disabled={loading}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentForm.invoiceId || !paymentForm.amount}
                  className="flex-1 px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
