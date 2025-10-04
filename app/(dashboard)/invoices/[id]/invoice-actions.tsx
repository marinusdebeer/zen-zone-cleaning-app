/**
 * INVOICE ACTIONS (Client Component)
 * 
 * Purpose:
 * Action button dropdown for invoice detail page
 */

'use client';

import { Edit2, Send, Download, Copy, DollarSign } from 'lucide-react';
import { ActionButtonDropdown } from '@/ui/components/action-button-dropdown';
import { useRouter } from 'next/navigation';

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter();

  if (status === 'PAID') {
    return null;
  }

  return (
    <ActionButtonDropdown
      primaryLabel="Edit Invoice"
      primaryHref={`/invoices/${invoiceId}/edit`}
      primaryIcon={<Edit2 className="w-4 h-4" />}
      actions={[
        ...(status === 'DRAFT' ? [
          { 
            label: 'Send to Client', 
            icon: <Send className="w-4 h-4" />,
            variant: 'success' as const,
            onClick: () => {
              // TODO: Implement send invoice
              console.log('Send invoice');
            },
          },
        ] : []),
        { 
          label: 'Download PDF', 
          icon: <Download className="w-4 h-4" />,
          onClick: () => {
            // TODO: Implement PDF generation
            console.log('Download PDF');
          },
        },
        { 
          label: 'Duplicate Invoice', 
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            // TODO: Implement duplicate
            router.push(`/invoices/new?duplicateFrom=${invoiceId}`);
          },
        },
        ...(status !== 'DRAFT' ? [
          { 
            label: 'Record Payment', 
            icon: <DollarSign className="w-4 h-4" />,
            variant: 'success' as const,
            onClick: () => {
              // TODO: Implement record payment
              console.log('Record payment');
            },
          },
        ] : []),
      ]}
    />
  );
}

