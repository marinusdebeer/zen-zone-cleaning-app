/**
 * INVOICE FORM BUSINESS LOGIC HOOK
 * 
 * Purpose:
 * Manages invoice form state and submission logic
 * Handles both create and edit modes
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/server/actions/invoices';
import { format } from 'date-fns';

interface ExistingInvoice {
  id: string;
  jobId: string | null;
  clientId: string;
  visitIds: any;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: string | null;
  discountValue: number | null;
  discountAmount: number;
  total: number;
  status: string;
  dueAt: Date | string | null;
  notes: string | null;
  lineItems?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface UseInvoiceFormProps {
  orgId: string;
  existingInvoice?: ExistingInvoice;
  jobs?: any[];
  clients?: any[];
  onSuccess?: () => void;
}

export function useInvoiceForm({ 
  orgId, 
  existingInvoice, 
  jobs = [],
  clients = [],
  onSuccess 
}: UseInvoiceFormProps) {
  const router = useRouter();
  const isEditMode = !!existingInvoice;

  const [formData, setFormData] = useState({
    creationMode: 'job' as 'job' | 'scratch',
    jobId: existingInvoice?.jobId || '',
    clientId: existingInvoice?.clientId || '',
    visitIds: Array.isArray(existingInvoice?.visitIds) ? existingInvoice.visitIds : [],
    subtotal: existingInvoice?.subtotal?.toString() || '',
    taxRate: existingInvoice?.taxRate?.toString() || '10',
    discountType: existingInvoice?.discountType || 'none',
    discountValue: existingInvoice?.discountValue?.toString() || '0',
    dueDate: existingInvoice?.dueAt 
      ? format(new Date(existingInvoice.dueAt), 'yyyy-MM-dd')
      : '',
    notes: existingInvoice?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedJob = jobs.find(j => j.id === formData.jobId);
  const selectedClient = clients.find(c => c.id === formData.clientId);

  // Calculate pricing
  const taxAmount = formData.subtotal 
    ? parseFloat(formData.subtotal) * (parseFloat(formData.taxRate) / 100) 
    : 0;
  
  let discountAmount = 0;
  if (formData.discountType === 'percentage' && formData.subtotal) {
    discountAmount = parseFloat(formData.subtotal) * (parseFloat(formData.discountValue) / 100);
  } else if (formData.discountType === 'fixed') {
    discountAmount = parseFloat(formData.discountValue);
  }

  const total = formData.subtotal 
    ? parseFloat(formData.subtotal) + taxAmount - discountAmount
    : 0;

  const handleFieldChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const clientId = formData.creationMode === 'job' && selectedJob
        ? selectedJob.client.id
        : formData.clientId;

      if (!clientId) {
        throw new Error('Please select a client');
      }

      if (formData.creationMode === 'job' && !formData.jobId) {
        throw new Error('Please select a job');
      }

      if (!formData.subtotal || parseFloat(formData.subtotal) <= 0) {
        throw new Error('Please enter a valid subtotal');
      }

      const invoiceData = {
        ...(isEditMode && existingInvoice && { id: existingInvoice.id }),
        jobId: formData.creationMode === 'job' ? formData.jobId : undefined,
        clientId,
        visitIds: formData.visitIds,
        subtotal: parseFloat(formData.subtotal),
        taxRate: parseFloat(formData.taxRate),
        discountType: formData.discountType !== 'none' ? formData.discountType : undefined,
        discountValue: formData.discountType !== 'none' ? parseFloat(formData.discountValue) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        notes: formData.notes || undefined,
      };

      if (isEditMode && existingInvoice) {
        // TODO: Implement updateInvoice
        throw new Error('Invoice editing not yet implemented');
      } else {
        await createInvoice(invoiceData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/invoices');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    selectedJob,
    selectedClient,
    taxAmount,
    discountAmount,
    total,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    error,
    isEditMode,
  };
}

