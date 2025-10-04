/**
 * JOB LINE ITEMS SECTION
 * 
 * Wrapper for EditableLineItems component with job-specific API integration
 */

'use client';

import { useRouter } from 'next/navigation';
import { EditableLineItems, type LineItem } from '@/ui/components/editable-line-items';

interface JobLineItemsSectionProps {
  jobId: string;
  lineItems: any[];
  taxRate: number;
}

export function JobLineItemsSection({ jobId, lineItems, taxRate }: JobLineItemsSectionProps) {
  const router = useRouter();

  const handleUpdate = async (items: LineItem[]) => {
    const response = await fetch(`/api/jobs/${jobId}/line-items-bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItems: items }),
    });

    if (!response.ok) {
      throw new Error('Failed to update line items');
    }

    router.refresh();
  };

  return (
    <EditableLineItems
      items={lineItems as unknown as LineItem[]}
      taxRate={taxRate}
      onUpdate={handleUpdate}
      entityType="job"
    />
  );
}

