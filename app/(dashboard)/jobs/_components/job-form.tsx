/**
 * JOB FORM (Main Orchestrator Component)
 * 
 * Purpose:
 * Main job creation/editing form that composes all job form sections.
 * Handles both create and edit modes with the same component.
 * 
 * Features:
 * - Unified create/edit interface
 * - Composes modular section components
 * - Shows visit preview for recurring jobs
 * - Validates and submits to server
 * 
 * ⚠️ MODULAR DESIGN: Keep under500lines
 */

'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useJobForm } from './use-job-form';
import { JobTypeSelector } from './job-type-selector';
import { JobClientSelector } from './job-client-selector';
import { JobDetailsSection } from './job-details-section';
import { JobScheduleSection } from './job-schedule-section';
import { JobBillingSection } from './job-billing-section';
import { JobTeamSection } from './job-team-section';
import { VisitPreviewCard } from './visit-preview-card';
import { JobLineItems } from './job-line-items';

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

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

interface JobFormProps {
  clients: Client[];
  teamMembers: TeamMember[];
  orgId: string;
  existingJob?: ExistingJob;
  fromSource?: any; // From request or estimate conversion
  sourceEstimate?: any; // From estimate conversion (new flow)
  initialStartTime?: string; // ISO string from calendar
  initialEndTime?: string; // ISO string from calendar
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function JobForm({ clients, teamMembers, orgId, existingJob, fromSource, sourceEstimate, initialStartTime, initialEndTime, onCancel, onSuccess }: JobFormProps) {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    visitPreview,
    visitCount,
    isSubmitting,
    error,
    isEditMode,
  } = useJobForm({ orgId, existingJob, fromSource: fromSource || sourceEstimate, initialStartTime, initialEndTime, onSuccess });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Job' : 'Create Job'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode ? 'Update job details' : 'Schedule work for your client'}
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        ) : (
          <Link
            href={isEditMode && existingJob ? `/jobs/${existingJob.id}` : '/jobs'}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-brand-bg-tertiary border-2 border-brand-danger rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-brand-danger mr-2 flex-shrink-0" />
          <span className="text-brand-text-secondary">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Type */}
        <JobTypeSelector
          value={formData.jobType}
          onChange={(value) => handleFieldChange({ jobType: value })}
          disabled={isSubmitting}
          isEditMode={isEditMode}
        />

        {/* Client & Property */}
        <JobClientSelector
          clients={clients}
          selectedClientId={formData.clientId}
          selectedPropertyId={formData.propertyId}
          onClientChange={(value) => handleFieldChange({ clientId: value })}
          onPropertyChange={(value) => handleFieldChange({ propertyId: value })}
          disabled={isSubmitting}
        />

        {/* Job Details */}
        <JobDetailsSection
          title={formData.title}
          description={formData.description}
          onTitleChange={(value) => handleFieldChange({ title: value })}
          onDescriptionChange={(value) => handleFieldChange({ description: value })}
          disabled={isSubmitting}
        />

        {/* Schedule */}
        <JobScheduleSection
          jobType={formData.jobType}
          startDate={formData.startDate}
          startTime={formData.startTime}
          duration={formData.duration}
          recurringPattern={formData.recurringPattern}
          recurringDays={formData.recurringDays}
          recurringEndDate={formData.recurringEndDate}
          onStartDateChange={(value) => handleFieldChange({ startDate: value })}
          onStartTimeChange={(value) => handleFieldChange({ startTime: value })}
          onDurationChange={(value) => handleFieldChange({ duration: value })}
          onPatternChange={(value) => handleFieldChange({ recurringPattern: value })}
          onDaysChange={(days) => handleFieldChange({ recurringDays: days })}
          onEndDateChange={(value) => handleFieldChange({ recurringEndDate: value })}
          disabled={isSubmitting}
          isEditMode={isEditMode}
        />

        {/* Billing */}
        <JobBillingSection
          billingFrequency={formData.billingFrequency}
          taxRate={formData.taxRate}
          onBillingFrequencyChange={(value) => handleFieldChange({ billingFrequency: value })}
          onTaxRateChange={(value) => handleFieldChange({ taxRate: value })}
          disabled={isSubmitting}
        />

        {/* Visit Preview - Only in create mode */}
        {!isEditMode && formData.jobType === 'recurring' && (
          <VisitPreviewCard visitCount={visitCount} visitPreview={visitPreview} />
        )}

        {/* Line Items - Always show */}
        <JobLineItems
          lineItems={formData.lineItems}
          onChange={(items) => handleFieldChange({ lineItems: items })}
          disabled={isSubmitting}
          taxRate={formData.taxRate}
          onTaxRateChange={(value) => handleFieldChange({ taxRate: value })}
        />

        {/* Team Assignment - Only in create mode */}
        {!isEditMode && (
          <JobTeamSection
            teamMembers={teamMembers}
            selectedAssignees={formData.assignees}
            onAssigneesChange={(assignees) => handleFieldChange({ assignees })}
            disabled={isSubmitting}
          />
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-brand-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <Link
              href={isEditMode && existingJob ? `/jobs/${existingJob.id}` : '/jobs'}
              className="px-6 py-2.5 border border-brand-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
            >
              Cancel
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.clientId || !formData.startDate}
            className="px-6 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Job' : 'Create Job'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

