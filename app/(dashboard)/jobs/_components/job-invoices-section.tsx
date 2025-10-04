/**
 * JOB INVOICES SECTION
 * 
 * Displays linked invoices for the job
 */

'use client';

import Link from 'next/link';
import { Receipt, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  number: number;
  status: string;
  dueDate: Date | string | null;
  payments: any[];
}

interface JobInvoicesSectionProps {
  invoices: Invoice[];
}

export function JobInvoicesSection({ invoices }: JobInvoicesSectionProps) {
  if (invoices.length === 0) return null;

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold text-brand-text mb-4 flex items-center">
        <Receipt className="w-5 h-5 mr-2 text-brand" />
        Invoices ({invoices.length})
      </h2>
      <div className="space-y-3">
        {invoices.map(invoice => (
          <Link
            key={invoice.id}
            href={`/invoices/${invoice.id}`}
            className="block p-4 border border-brand-border rounded-lg hover:border-brand hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <p className="font-semibold text-brand-text">Invoice #{invoice.number}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'Paid' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : invoice.status === 'Overdue'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                {invoice.dueDate && (
                  <p className="text-sm text-brand-text-secondary mt-1">
                    Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </p>
                )}
                {invoice.payments && invoice.payments.length > 0 && (
                  <p className="text-xs text-brand-text-tertiary mt-1">
                    {invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''} received
                  </p>
                )}
              </div>
              <div className="ml-4">
                <DollarSign className="w-5 h-5 text-brand" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

