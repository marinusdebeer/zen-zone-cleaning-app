/**
 * ESTIMATE FORM (Main Orchestrator Component)
 * 
 * Purpose:
 * Main estimate creation/editing form that composes all estimate form sections.
 * Handles both create and edit modes with the same component.
 * 
 * Features:
 * - Unified create/edit interface
 * - Composes modular section components
 * - Client/Lead selection
 * - Validates and submits to server
 * 
 * ⚠️ MODULAR DESIGN: Keep under 500 lines
 */

'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle, Clock, X, FileText } from 'lucide-react';
import { useEstimateForm } from './use-estimate-form';
import { EstimateRecipientSelector } from './estimate-recipient-selector';
import { EstimateDetailsSection } from './estimate-details-section';
import { EstimateLineItems } from './estimate-line-items';
import { EstimatePricingCalculator } from './estimate-pricing-calculator';
import { CustomSelect } from '@/ui/components/custom-select';

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface Lead {
  id: string;
  name: string;
  emails: string[];
}

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

interface EstimateFormProps {
  clients: Client[];
  leads: Lead[];
  orgId: string;
  existingEstimate?: ExistingEstimate;
  fromRequest?: { clientId: string; propertyId: string | null; title: string; description: string | null } | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function EstimateForm({ 
  clients, 
  leads, 
  orgId, 
  existingEstimate,
  fromRequest,
  onCancel, 
  onSuccess 
}: EstimateFormProps) {
  const {
    formData,
    lineItems,
    pricing,
    handleFieldChange,
    setLineItems,
    handleSubmit,
    isSubmitting,
    error,
    isEditMode,
  } = useEstimateForm({ orgId, existingEstimate, fromRequest, onSuccess });

  // Validation
  const isValid = 
    formData.title && 
    formData.clientId &&
    lineItems.length > 0 &&
    lineItems.every(item => item.name && item.quantity && item.unitPrice);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center text-gray-900 dark:text-white">
            <FileText className="w-7 h-7 mr-2 text-brand" />
            {isEditMode ? 'Edit Estimate' : 'Create New Estimate'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode ? 'Update estimate details' : 'Prepare a quote for a client or lead'}
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
            href="/estimates"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selection */}
        <EstimateRecipientSelector
          clients={clients}
          leads={leads}
          forType={formData.forType}
          selectedClientId={formData.clientId}
          selectedPropertyId={formData.propertyId}
          onTypeChange={(type) => handleFieldChange({ 
            forType: type,
            propertyId: type === 'lead' ? '' : formData.propertyId
          })}
          onClientChange={(clientId) => handleFieldChange({ clientId, propertyId: '' })}
          onPropertyChange={(propertyId) => handleFieldChange({ propertyId })}
          disabled={isSubmitting}
        />

        {/* Estimate Details */}
        <EstimateDetailsSection
          title={formData.title}
          description={formData.description}
          onTitleChange={(title) => handleFieldChange({ title })}
          onDescriptionChange={(description) => handleFieldChange({ description })}
          disabled={isSubmitting}
        />

        {/* Line Items */}
        <EstimateLineItems
          lineItems={lineItems}
          onChange={setLineItems}
          disabled={isSubmitting}
        />

        {/* Pricing Calculator */}
        <EstimatePricingCalculator
          subtotal={pricing.subtotal}
          taxRate={formData.taxRate}
          discountType={formData.discountType}
          discountValue={formData.discountValue}
          depositRequired={formData.depositRequired}
          depositType={formData.depositType}
          depositValue={formData.depositValue}
          onTaxRateChange={(taxRate) => handleFieldChange({ taxRate })}
          onDiscountTypeChange={(discountType) => handleFieldChange({ discountType, discountValue: '0' })}
          onDiscountValueChange={(discountValue) => handleFieldChange({ discountValue })}
          onDepositRequiredChange={(depositRequired) => handleFieldChange({ depositRequired })}
          onDepositTypeChange={(depositType) => handleFieldChange({ depositType })}
          onDepositValueChange={(depositValue) => handleFieldChange({ depositValue })}
          disabled={isSubmitting}
        />

        {/* Status & Valid Until */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status & Validity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <CustomSelect
                value={formData.status}
                onChange={(status) => handleFieldChange({ status })}
                disabled={isSubmitting}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'SENT', label: 'Sent' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
                placeholder="Select status..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleFieldChange({ validUntil: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/estimates"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
            >
              Cancel
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="px-6 py-2.5 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold rounded-lg hover:from-brand hover:to-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Estimate' : 'Create Estimate'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

