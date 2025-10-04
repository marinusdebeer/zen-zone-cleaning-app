/**
 * REQUEST ACTIONS (Client Component)
 * 
 * Purpose:
 * Action button dropdown for request detail page
 */

'use client';

import { Edit2, FileText, XCircle, Copy } from 'lucide-react';
import { ActionButtonDropdown } from '@/ui/components/action-button-dropdown';
import { useRouter } from 'next/navigation';

interface RequestActionsProps {
  requestId: string;
  status: string;
}

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const router = useRouter();

  return (
    <ActionButtonDropdown
      primaryLabel="Edit Request"
      primaryHref={`/requests/${requestId}/edit`}
      primaryIcon={<Edit2 className="w-4 h-4" />}
      actions={[
        {
          label: 'Convert to Estimate',
          icon: <FileText className="w-4 h-4" />,
          href: `/estimates/new?requestId=${requestId}`,
          variant: 'success',
        },
        {
          label: 'Duplicate Request',
          icon: <Copy className="w-4 h-4" />,
          onClick: () => console.log('Duplicate request'),
        },
        ...(status !== 'DECLINED' ? [
          {
            label: 'Mark as Declined',
            icon: <XCircle className="w-4 h-4" />,
            variant: 'danger' as const,
            onClick: () => console.log('Decline request'),
          },
        ] : []),
      ]}
    />
  );
}

