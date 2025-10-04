/**
 * ESTIMATE FORM BUSINESS LOGIC HOOK
 * 
 * Purpose:
 * Custom hook managing all estimate form state and submission logic.
 * Separates business logic from UI for better testability and reusability.
 * 
 * Features:
 * - Form state management
 * - Create/update logic switching
 * - Client/Lead selection handling
 * - Error handling
 * - Form submission
 * 
 * ⚠️ MODULAR DESIGN: Keep under 500 lines for hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createEstimate, updateEstimate } from '@/server/actions/estimates';
import { format } from 'date-fns';
import { LineItem } from './estimate-line-items';
import { calculatePricing } from './use-estimate-pricing';

interface ExistingEstimate {
  id: string;
  title: string;
  description: string | null;
  clientId: string;
  propertyId: string | null;
  amount: number;
  status: string;
  validUntil: Date | null;
  // Pricing fields
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number;
  total?: number;
  depositRequired?: boolean;
  depositType?: string | null;
  depositValue?: number | null;
  depositAmount?: number;
  // Line items
  lineItems?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    order: number;
  }>;
}

interface UseEstimateFormProps {
  orgId: string;
  existingEstimate?: ExistingEstimate;
  fromRequest?: { clientId: string; propertyId: string | null; title: string; description: string | null } | null;
  onSuccess?: () => void;
}

export function useEstimateForm({ orgId, existingEstimate, fromRequest, onSuccess }: UseEstimateFormProps) {
  const router = useRouter();
  const isEditMode = !!existingEstimate;

  const [formData, setFormData] = useState({
    title: existingEstimate?.title || fromRequest?.title || '',
    description: existingEstimate?.description || fromRequest?.description || '',
    forType: 'client' as 'client' | 'lead', // Default to client
    clientId: existingEstimate?.clientId || fromRequest?.clientId || '',
    propertyId: existingEstimate?.propertyId || fromRequest?.propertyId || '',
    validUntil: existingEstimate?.validUntil 
      ? format(new Date(existingEstimate.validUntil), 'yyyy-MM-dd') 
      : '',
    status: existingEstimate?.status || 'DRAFT',
    // Pricing - initialize from existing estimate
    taxRate: existingEstimate?.taxRate?.toString() || '0',
    discountType: existingEstimate?.discountType || 'none',
    discountValue: existingEstimate?.discountValue?.toString() || '0',
    depositRequired: existingEstimate?.depositRequired || false,
    depositType: existingEstimate?.depositType || 'percentage',
    depositValue: existingEstimate?.depositValue?.toString() || '0',
  });

  // Initialize line items from existing estimate
  const [lineItems, setLineItems] = useState<LineItem[]>(
    existingEstimate?.lineItems?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      total: item.quantity * item.unitPrice,
    })) || []
  );
  
  const [pricing, setPricing] = useState({
    subtotal: existingEstimate?.subtotal || 0,
    taxAmount: existingEstimate?.taxAmount || 0,
    discountAmount: existingEstimate?.discountAmount || 0,
    total: existingEstimate?.total || 0,
    depositAmount: existingEstimate?.depositAmount || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate pricing whenever dependencies change
  const updatePricing = useCallback(() => {
    const calculations = calculatePricing(
      lineItems,
      formData.taxRate,
      formData.discountType,
      formData.discountValue,
      formData.depositRequired,
      formData.depositType,
      formData.depositValue
    );
    setPricing(calculations);
  }, [lineItems, formData.taxRate, formData.discountType, formData.discountValue, 
      formData.depositRequired, formData.depositType, formData.depositValue]);

  useEffect(() => {
    updatePricing();
  }, [updatePricing]);

  // Clear propertyId when switching from client to lead
  useEffect(() => {
    if (formData.forType === 'lead' && formData.propertyId) {
      setFormData(prev => ({ ...prev, propertyId: '' }));
    }
  }, [formData.forType]);

  const handleFieldChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isEditMode && existingEstimate) {
        const updateData = {
          id: existingEstimate.id,
          title: formData.title,
          description: formData.description || undefined,
          clientId: formData.clientId || undefined,
          propertyId: formData.propertyId || undefined,
          validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
          status: formData.status,
          // Pricing - only tax rate and deposit settings (cost calculated from line items)
          taxRate: parseFloat(formData.taxRate) || 13,
          depositRequired: formData.depositRequired,
          depositType: formData.depositRequired ? formData.depositType : undefined,
          depositValue: formData.depositRequired ? parseFloat(formData.depositValue) : undefined,
          // Line items (where the cost comes from)
          lineItems: lineItems.map((item, index) => ({
            name: item.name,
            description: item.description || '',
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: item.total,
            order: index,
          })),
        };
        await updateEstimate(updateData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/estimates/${existingEstimate.id}`);
        }
      } else {
        const createData = {
          title: formData.title,
          description: formData.description || undefined,
          clientId: formData.clientId || undefined,
          propertyId: formData.propertyId || undefined,
          validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
          status: formData.status,
          // Pricing - only tax rate and deposit settings (cost calculated from line items)
          taxRate: parseFloat(formData.taxRate) || 13,
          depositRequired: formData.depositRequired,
          depositType: formData.depositRequired ? formData.depositType : undefined,
          depositValue: formData.depositRequired ? parseFloat(formData.depositValue) : undefined,
          // Line items (where the cost comes from)
          lineItems: lineItems.map((item, index) => ({
            name: item.name,
            description: item.description || '',
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: item.total,
            order: index,
          })),
        };
        await createEstimate(createData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/estimates');
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} estimate`);
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    lineItems,
    pricing,
    handleFieldChange,
    setLineItems,
    handleSubmit,
    isSubmitting,
    error,
    isEditMode,
  };
}

