/**
 * REQUEST FORM BUSINESS LOGIC HOOK
 * 
 * Purpose:
 * Manages request form state and submission
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRequest, updateRequest } from '@/server/actions/requests';

interface ExistingRequest {
  id: string;
  clientId: string;
  propertyId: string | null;
  title: string;
  description: string | null;
  source: string | null;
  urgency: string;
  status: string;
  notes: string | null;
}

interface UseRequestFormProps {
  orgId: string;
  existingRequest?: ExistingRequest;
  onSuccess?: () => void;
}

export function useRequestForm({ orgId, existingRequest, onSuccess }: UseRequestFormProps) {
  const router = useRouter();
  const isEditMode = !!existingRequest;

  const [formData, setFormData] = useState({
    clientId: existingRequest?.clientId || '',
    propertyId: existingRequest?.propertyId || '',
    title: existingRequest?.title || '',
    description: existingRequest?.description || '',
    source: existingRequest?.source || 'website',
    urgency: existingRequest?.urgency || 'normal',
    notes: existingRequest?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFieldChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.clientId) {
        throw new Error('Please select a client');
      }

      if (!formData.title) {
        throw new Error('Please enter a title');
      }

      const requestData = {
        ...(isEditMode && existingRequest && { id: existingRequest.id }),
        clientId: formData.clientId,
        propertyId: formData.propertyId || undefined,
        title: formData.title,
        description: formData.description || undefined,
        source: formData.source || undefined,
        urgency: formData.urgency,
        notes: formData.notes || undefined,
      };

      if (isEditMode && existingRequest) {
        await updateRequest(orgId, requestData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/requests/${existingRequest.id}`);
        }
      } else {
        await createRequest(orgId, requestData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/requests');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    error,
    isEditMode,
  };
}

