/**
 * INVOICE FORM (Main Orchestrator Component)
 * 
 * Purpose:
 * Unified invoice creation/editing form
 * Handles both create and edit modes with same component
 * 
 * ⚠️ MODULAR DESIGN: Keep under 300 lines
 */

'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle, X, Receipt } from 'lucide-react';
import { useInvoiceForm } from './use-invoice-form';
import { InvoiceJobSelector } from './invoice-job-selector';
import { InvoiceLineItemsDisplay } from './invoice-line-items-display';
import { InvoicePricingSection } from './invoice-pricing-section';

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

interface InvoiceFormProps {
  orgId: string;
  jobs?: any[];
  clients?: any[];
  existingInvoice?: ExistingInvoice;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvoiceForm({
  orgId,
  jobs = [],
  clients = [],
  existingInvoice,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const {
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
  } = useInvoiceForm({ orgId, existingInvoice, jobs, clients, onSuccess });

  // Get line items from job if available
  const lineItems = selectedJob?.lineItems || existingInvoice?.lineItems || [];
  const calculatedSubtotal = lineItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const displaySubtotal = formData.creationMode === 'job' ? calculatedSubtotal : parseFloat(formData.subtotal) || 0;

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="w-6 h-6 text-brand mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
            </h1>
          </div>
        </div>
        {isEditMode && existingInvoice && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Invoice #{existingInvoice.id.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Job/Client Selection */}
        <InvoiceJobSelector
          creationMode={formData.creationMode}
          jobs={jobs}
          clients={clients}
          selectedJobId={formData.jobId}
          selectedClientId={formData.clientId}
          onModeChange={(mode) => handleFieldChange({ creationMode: mode, jobId: '', clientId: '' })}
          onJobChange={(jobId) => handleFieldChange({ jobId })}
          onClientChange={(clientId) => handleFieldChange({ clientId })}
          disabled={isSubmitting || isEditMode}
        />

        {/* Line Items */}
        {(selectedJob || formData.creationMode === 'scratch') && (
          <InvoiceLineItemsDisplay
            lineItems={lineItems}
            subtotal={formData.subtotal}
            onSubtotalChange={(subtotal) => handleFieldChange({ subtotal })}
            fromJob={formData.creationMode === 'job'}
            disabled={isSubmitting}
          />
        )}

        {/* Pricing & Terms */}
        {(selectedJob || (formData.creationMode === 'scratch' && formData.subtotal)) && (
          <InvoicePricingSection
            subtotal={displaySubtotal}
            taxRate={formData.taxRate}
            discountType={formData.discountType}
            discountValue={formData.discountValue}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            total={total}
            dueDate={formData.dueDate}
            notes={formData.notes}
            onTaxRateChange={(taxRate) => handleFieldChange({ taxRate })}
            onDiscountTypeChange={(discountType) => handleFieldChange({ discountType, discountValue: '0' })}
            onDiscountValueChange={(discountValue) => handleFieldChange({ discountValue })}
            onDueDateChange={(dueDate) => handleFieldChange({ dueDate })}
            onNotesChange={(notes) => handleFieldChange({ notes })}
            disabled={isSubmitting}
          />
        )}

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
                href={isEditMode && existingInvoice ? `/invoices/${existingInvoice.id}` : '/invoices'}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.subtotal}
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
                  {isEditMode ? 'Update Invoice' : 'Create Invoice'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

