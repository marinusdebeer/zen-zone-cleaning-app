/**
 * ESTIMATE ACTIONS (Client Component)
 * 
 * Purpose:
 * Action button dropdown for estimate detail page
 * Client component to handle onClick actions
 */

'use client';

import { useState } from 'react';
import { Edit2, Send, ThumbsUp, ThumbsDown, Briefcase, Copy } from 'lucide-react';
import { ActionButtonDropdown } from '@/ui/components/action-button-dropdown';
import { SendEstimateModal } from './send-estimate-modal';
import { useRouter } from 'next/navigation';

interface EstimateActionsProps {
  estimateId: string;
  status: string;
  convertedToJobId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  estimateTitle: string;
  estimateTotal: number;
}

export function EstimateActions({ 
  estimateId, 
  status, 
  convertedToJobId,
  clientName,
  clientEmail,
  clientPhone,
  estimateTitle,
  estimateTotal,
}: EstimateActionsProps) {
  const router = useRouter();
  const [showSendModal, setShowSendModal] = useState(false);

  // Build actions array based on current state
  const actions = [];

  // Send to Client - always available unless converted
  if (status !== 'CONVERTED') {
    actions.push({
      label: 'Send to Client',
      icon: <Send className="w-4 h-4" />,
      onClick: () => setShowSendModal(true),
    });
  }

  // Approve - available if not already approved or converted
  if (status !== 'APPROVED' && status !== 'CONVERTED') {
    actions.push({
      label: 'Mark as Approved',
      icon: <ThumbsUp className="w-4 h-4" />,
      variant: 'success' as const,
      onClick: async () => {
        const { approveEstimate } = await import('@/server/actions/estimate-email');
        await approveEstimate(estimateId);
        router.refresh();
      },
    });
  }

  // Reject - available if not already rejected or converted
  if (status !== 'REJECTED' && status !== 'CONVERTED') {
    actions.push({
      label: 'Mark as Rejected',
      icon: <ThumbsDown className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: async () => {
        const { rejectEstimate } = await import('@/server/actions/estimate-email');
        await rejectEstimate(estimateId);
        router.refresh();
      },
    });
  }

  // Convert to Job - available if not already converted
  if (!convertedToJobId && status !== 'CONVERTED') {
    actions.push({
      label: 'Convert to Job',
      icon: <Briefcase className="w-4 h-4" />,
      variant: 'success' as const,
      onClick: () => {
        router.push(`/jobs/new?fromEstimate=${estimateId}`);
      },
    });
  }

  // Duplicate - always available
  actions.push({
    label: 'Create Similar Estimate',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => {
      router.push(`/estimates/new?duplicateFrom=${estimateId}`);
    },
  });

  return (
    <>
      <ActionButtonDropdown
        primaryLabel="Edit Estimate"
        primaryHref={status !== 'CONVERTED' ? `/estimates/${estimateId}/edit` : undefined}
        primaryIcon={<Edit2 className="w-4 h-4" />}
        primaryDisabled={status === 'CONVERTED'}
        actions={actions}
      />

      {/* Send Estimate Modal */}
      <SendEstimateModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        estimateId={estimateId}
        clientName={clientName}
        clientEmail={clientEmail}
        clientPhone={clientPhone}
        estimateTitle={estimateTitle}
        estimateTotal={estimateTotal}
      />
    </>
  );
}

