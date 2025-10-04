/**
 * JOB EXPENSES SECTION
 * 
 * Wrapper for EditableExpenses component with job-specific API integration
 */

'use client';

import { useRouter } from 'next/navigation';
import { EditableExpenses, type Expense } from '@/ui/components/editable-expenses';

interface JobExpensesSectionProps {
  jobId: string;
  expenses: any[];
}

export function JobExpensesSection({ jobId, expenses }: JobExpensesSectionProps) {
  const router = useRouter();

  const handleUpdate = async (expensesList: Expense[]) => {
    const response = await fetch(`/api/jobs/${jobId}/expenses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses: expensesList }),
    });

    if (!response.ok) {
      throw new Error('Failed to update expenses');
    }

    router.refresh();
  };

  return (
    <EditableExpenses
      expenses={expenses as unknown as Expense[]}
      onUpdate={handleUpdate}
    />
  );
}

