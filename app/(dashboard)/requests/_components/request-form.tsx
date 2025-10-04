/**
 * REQUEST FORM (Main Orchestrator Component)
 * 
 * Purpose:
 * Unified request creation/editing form
 * Handles both create and edit modes
 */

'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle, X, FileText } from 'lucide-react';
import { useRequestForm } from './use-request-form';
import { RequestClientSelector } from './request-client-selector';
import { RequestDetailsSection } from './request-details-section';

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

interface Client {
  id: string;
  name: string;
  properties: { id: string; address: string }[];
}

interface RequestFormProps {
  orgId: string;
  clients: Client[];
  existingRequest?: ExistingRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RequestForm({
  orgId,
  clients,
  existingRequest,
  onSuccess,
  onCancel,
}: RequestFormProps) {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    error,
    isEditMode,
  } = useRequestForm({ orgId, existingRequest, onSuccess });

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-brand mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Request' : 'New Customer Request'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Client & Property Selection */}
        <RequestClientSelector
          clients={clients}
          selectedClientId={formData.clientId}
          selectedPropertyId={formData.propertyId}
          onClientChange={(clientId) => handleFieldChange({ clientId })}
          onPropertyChange={(propertyId) => handleFieldChange({ propertyId })}
          disabled={isSubmitting}
        />

        {/* Request Details */}
        <RequestDetailsSection
          title={formData.title}
          description={formData.description}
          source={formData.source}
          urgency={formData.urgency}
          notes={formData.notes}
          onTitleChange={(title) => handleFieldChange({ title })}
          onDescriptionChange={(description) => handleFieldChange({ description })}
          onSourceChange={(source) => handleFieldChange({ source })}
          onUrgencyChange={(urgency) => handleFieldChange({ urgency })}
          onNotesChange={(notes) => handleFieldChange({ notes })}
          disabled={isSubmitting}
        />

        {/* Form Actions */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <div className="flex justify-end gap-3">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            ) : (
              <Link
                href={isEditMode && existingRequest ? `/requests/${existingRequest.id}` : '/requests'}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.clientId || !formData.title}
              className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Request' : 'Create Request'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

