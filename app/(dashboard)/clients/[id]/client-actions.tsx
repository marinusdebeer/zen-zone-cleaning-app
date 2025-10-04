/**
 * CLIENT ACTIONS (Client Component)
 * 
 * Purpose:
 * Action button dropdown for client detail page
 */

'use client';

import { Edit2, FileText, Briefcase, Home, Copy, Archive } from 'lucide-react';
import { ActionButtonDropdown } from '@/ui/components/action-button-dropdown';
import { useRouter } from 'next/navigation';

interface ClientActionsProps {
  clientId: string;
}

export function ClientActions({ clientId }: ClientActionsProps) {
  const router = useRouter();

  return (
    <ActionButtonDropdown
      primaryLabel="Edit Client"
      primaryHref={`/clients/${clientId}/edit`}
      primaryIcon={<Edit2 className="w-4 h-4" />}
      actions={[
        { 
          label: 'Create Estimate', 
          icon: <FileText className="w-4 h-4" />,
          href: `/estimates/new?clientId=${clientId}`,
        },
        { 
          label: 'Create Job', 
          icon: <Briefcase className="w-4 h-4" />,
          href: `/jobs/new?clientId=${clientId}`,
        },
        { 
          label: 'Add Property', 
          icon: <Home className="w-4 h-4" />,
          href: `/properties/new?clientId=${clientId}`,
        },
        { 
          label: 'Duplicate Client', 
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            // TODO: Implement duplicate
            router.push(`/clients/new?duplicateFrom=${clientId}`);
          },
        },
        { 
          label: 'Archive Client', 
          icon: <Archive className="w-4 h-4" />,
          variant: 'danger' as const,
          onClick: () => {
            // TODO: Implement archive
            console.log('Archive client');
          },
        },
      ]}
    />
  );
}

