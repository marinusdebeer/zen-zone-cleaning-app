/**
 * ⚠️ MODULAR DESIGN REMINDER
 * This file is 312+ lines and should be refactored into smaller components.
 * See docs/MODULAR_DESIGN.md for guidelines.
 * Target: <300 lines per component
 * 
 * Suggested extractions:
 * - Invoice table component
 * - Search and filter controls component
 * - Stats cards component
 * - Status filter buttons component
 */

'use client';

import { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  Send,
  FileText,
  XCircle,
  ArrowRight,
  Users,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { calculateFullPricing } from '@/lib/pricing-calculator';

interface Invoice {
  id: string;
  status: string;
  taxRate: number;
  issuedAt: Date | string | null; // Can be Date, ISO string, or null after serialize()
  dueAt: Date | string | null;
  paidAt: Date | string | null;
  createdAt: Date | string;
  client: { name: string };
  job: { title: string } | null;
  payments: { amount: number }[];
  lineItems: Array<{
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface InvoicesPageClientProps {
  invoices: Invoice[];
  statusCounts: Record<string, number>;
  stats: {
    total: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
}

const statusConfig = {
  'DRAFT': { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600', icon: FileText },
  'SENT': { color: 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300 border-brand', icon: Send },
  'PAID': { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800', icon: CheckCircle },
  'OVERDUE': { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800', icon: XCircle },
  'CANCELLED': { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600', icon: XCircle },
};

export function InvoicesPageClient({ invoices, statusCounts, stats }: InvoicesPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      invoice.client.name.toLowerCase().includes(searchLower) ||
      (invoice.job?.title && invoice.job.title.toLowerCase().includes(searchLower)) ||
      invoice.id.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Receipt className="w-7 h-7 mr-2 text-brand" />
            Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage billing and payments</p>
        </div>
        <Link
          href="/invoices/new"
          className="px-4 py-2 bg-gradient-to-r from-brand to-brand-dark text-white rounded-lg hover:from-brand hover:to-brand-dark transition-all font-medium shadow-lg inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-brand" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <FileText className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-brand-info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <Receipt className="h-8 w-8 text-brand" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search invoices by client, job, or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-brand text-white'
                : 'bg-brand-bg-secondary hover:bg-[var(--tenant-bg-tertiary)]'
            }`}
          >
            All ({stats.total})
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-brand text-white'
                  : 'bg-brand-bg-secondary hover:bg-[var(--tenant-bg-tertiary)]'
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredInvoices.length} of {stats.total} invoices
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-brand-bg rounded-xl shadow-sm p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No invoices found' : 'No invoices yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Invoices will appear here once you bill for completed jobs'}
          </p>
        </div>
      ) : (
        <div className="bg-brand-bg rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-bg-secondary dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Issued
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Paid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig]?.icon || FileText;
                
                // Calculate total from line items
                const pricing = calculateFullPricing({
                  lineItems: invoice.lineItems.map(item => ({
                    quantity: Number(item.quantity) || 1,
                    unitPrice: Number(item.unitPrice) || 0,
                    total: Number(item.total) || 0,
                  })),
                  taxRate: Number(invoice.taxRate),
                });
                
                const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
                const amountRemaining = pricing.total - amountPaid;

                return (
                  <tr key={invoice.id} onClick={() => window.location.href = `/invoices/${invoice.id}`} className="hover:bg-[var(--tenant-bg-tertiary)] transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        #{invoice.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.client.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.job ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.job.title || invoice.job.client.name}</p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center ${statusConfig[invoice.status as keyof typeof statusConfig]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {invoice.issuedAt 
                          ? new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </div>
                      {invoice.dueAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Due: {new Date(invoice.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${pricing.total.toFixed(2)}
                      </p>
                      {pricing.taxAmount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +${pricing.taxAmount.toFixed(2)} tax
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {amountPaid > 0 ? (
                        <div>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ${amountPaid.toFixed(2)}
                          </p>
                          {amountRemaining > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              ${amountRemaining.toFixed(2)} due
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
