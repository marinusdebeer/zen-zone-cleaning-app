/**
 * JOB FORM BUSINESS LOGIC HOOK
 * 
 * Purpose:
 * Custom hook managing all job form state and submission logic.
 * Separates business logic from UI for better testability and reusability.
 * 
 * Features:
 * - Form state management
 * - Create/update logic switching
 * - Visit count calculation
 * - Error handling
 * - Form submission
 * 
 * ⚠️ MODULAR DESIGN: Keep under 500 lines for hooks
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob } from '@/server/actions/jobs';
import { calculateVisitCount, getVisitPreview } from '@/server/utils/visit-generator';
import { format } from 'date-fns';

interface ExistingJob {
  id: string;
  title: string | null;
  description: string | null;
  clientId: string;
  propertyId: string | null;
  status: string;
  priority: string;
  startDate: Date | string | null; // Can be Date or ISO string after serialize()
  isRecurring: boolean;
  recurringPattern: string | null;
  recurringDays: any;
  recurringEndDate: Date | string | null; // Can be Date or ISO string after serialize()
  billingFrequency: string;
  taxRate?: number; // Default 13% - cost calculated from line items
  lineItems?: any[];
}

interface UseJobFormProps {
  orgId: string;
  existingJob?: ExistingJob;
  fromSource?: any; // From request or estimate
  initialStartTime?: string; // ISO string from calendar
  initialEndTime?: string; // ISO string from calendar
  onSuccess?: () => void;
}

export function useJobForm({ orgId, existingJob, fromSource, initialStartTime, initialEndTime, onSuccess }: UseJobFormProps) {
  const router = useRouter();
  const isEditMode = !!existingJob;

  // Calculate initial duration from calendar selection
  let initialDuration = 120; // Default 2 hours
  let startDateFromCalendar = '';
  let startTimeFromCalendar = '09:00';
  
  if (initialStartTime && initialEndTime) {
    const start = new Date(initialStartTime);
    const end = new Date(initialEndTime);
    initialDuration = Math.round((end.getTime() - start.getTime()) / (60 * 1000)); // in minutes
    startDateFromCalendar = format(start, 'yyyy-MM-dd');
    startTimeFromCalendar = format(start, 'HH:mm');
  }

  const [formData, setFormData] = useState({
    title: existingJob?.title || fromSource?.title || '',
    description: existingJob?.description || fromSource?.description || '',
    clientId: existingJob?.clientId || fromSource?.clientId || '',
    propertyId: existingJob?.propertyId || fromSource?.propertyId || '',
    jobType: (existingJob?.isRecurring ? 'recurring' : 'oneoff') as 'oneoff' | 'recurring',
    startDate: existingJob?.startDate ? format(new Date(existingJob.startDate), 'yyyy-MM-dd') : startDateFromCalendar || '',
    startTime: existingJob?.startDate ? format(new Date(existingJob.startDate), 'HH:mm') : startTimeFromCalendar,
    duration: initialDuration,
    priority: existingJob?.priority || 'normal',
    status: existingJob?.status || 'Draft',
    recurringPattern: existingJob?.recurringPattern || 'weekly',
    recurringDays: (existingJob?.recurringDays && Array.isArray(existingJob.recurringDays) ? existingJob.recurringDays as number[] : []),
    recurringEndDate: existingJob?.recurringEndDate ? format(new Date(existingJob.recurringEndDate), 'yyyy-MM-dd') : '',
    billingFrequency: existingJob?.billingFrequency || 'PER_VISIT',
    assignees: [] as string[],
    // Pricing - only tax rate (cost calculated from line items)
    taxRate: existingJob?.taxRate || fromSource?.taxRate || 13,
    // Line items from estimate or existing job
    lineItems: existingJob?.lineItems || fromSource?.lineItems || [],
  });

  const [visitPreview, setVisitPreview] = useState<Date[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateVisitPreview = (data: typeof formData) => {
    if (data.jobType === 'recurring' && data.startDate) {
      try {
        const schedule = {
          isRecurring: true,
          recurringPattern: data.recurringPattern,
          recurringDays: data.recurringDays,
          startDate: new Date(data.startDate),
          recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
        };
        
        const count = calculateVisitCount(schedule);
        const preview = getVisitPreview(schedule, 5);
        
        setVisitCount(count);
        setVisitPreview(preview);
      } catch (err) {
        setVisitCount(0);
        setVisitPreview([]);
      }
    } else {
      setVisitCount(1);
      setVisitPreview(data.startDate ? [new Date(data.startDate)] : []);
    }
  };

  const handleFieldChange = (updates: Partial<typeof formData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Safely update visit preview, catching any errors
    try {
      updateVisitPreview(newData);
    } catch (error) {
      console.error('Error updating visit preview:', error);
      // Continue anyway - preview is not critical for form submission
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const isRecurring = formData.jobType === 'recurring';
      
      const jobData = {
        ...(isEditMode && existingJob && { id: existingJob.id }),
        title: formData.title.trim() || undefined,
        description: formData.description || undefined,
        clientId: formData.clientId,
        propertyId: formData.propertyId || undefined,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        startTime: formData.startTime,
        duration: formData.duration,
        isRecurring,
        recurringPattern: isRecurring ? formData.recurringPattern : undefined,
        recurringDays: isRecurring && formData.recurringDays.length > 0 ? formData.recurringDays : undefined,
        recurringEndDate: isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        billingFrequency: formData.billingFrequency,
        ...(!isEditMode && { assignees: formData.assignees }),
        // Pricing - only tax rate (cost calculated from line items at runtime)
        taxRate: formData.taxRate || 13,
        // Line items from estimate
        lineItems: formData.lineItems.length > 0 ? formData.lineItems : undefined,
        // Link back to estimate if converting
        convertedFromEstimateId: fromSource?.id,
        custom: {}
      };

      if (isEditMode && existingJob) {
        await updateJob(orgId, jobData);
        router.push(`/jobs/${existingJob.id}`);
      } else {
        await createJob(orgId, jobData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/jobs');
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} job`);
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    visitPreview,
    visitCount,
    isSubmitting,
    error,
    isEditMode,
  };
}

