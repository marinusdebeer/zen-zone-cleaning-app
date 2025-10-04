/**
 * JOB ACTIONS (Client Component)
 * 
 * Purpose:
 * Action button dropdown for job detail page
 */

'use client';

import { Edit2, Receipt, Copy, CheckCircle, Archive } from 'lucide-react';
import { ActionButtonDropdown } from '@/ui/components/action-button-dropdown';
import { useRouter } from 'next/navigation';

interface JobActionsProps {
  jobId: string;
  status: string;
}

export function JobActions({ jobId, status }: JobActionsProps) {
  const router = useRouter();

  return (
    <ActionButtonDropdown
      primaryLabel="Edit Job"
      primaryHref={`/jobs/${jobId}/edit`}
      primaryIcon={<Edit2 className="w-4 h-4" />}
      actions={[
        { 
          label: 'Create Invoice', 
          icon: <Receipt className="w-4 h-4" />,
          href: `/invoices/new?jobId=${jobId}`,
          variant: 'success' as const,
        },
        { 
          label: 'Duplicate Job', 
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            // TODO: Implement duplicate job
            router.push(`/jobs/new?duplicateFrom=${jobId}`);
          },
        },
        ...(status !== 'Completed' && status !== 'Canceled' ? [
          { 
            label: 'Mark as Completed', 
            icon: <CheckCircle className="w-4 h-4" />,
            variant: 'success' as const,
            onClick: () => {
              // TODO: Implement mark complete
              console.log('Complete job');
            },
          },
        ] : []),
        ...(status !== 'Canceled' ? [
          { 
            label: 'Cancel Job', 
            icon: <Archive className="w-4 h-4" />,
            variant: 'danger' as const,
            onClick: () => {
              // TODO: Implement cancel job
              console.log('Cancel job');
            },
          },
        ] : []),
      ]}
    />
  );
}

