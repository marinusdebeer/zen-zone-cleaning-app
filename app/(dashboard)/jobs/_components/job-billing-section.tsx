/**
 * JOB BILLING SECTION COMPONENT
 * 
 * Purpose:
 * Form section for job billing configuration.
 * 
 * Features:
 * - Billing frequency selection (at completion, per visit, weekly, monthly)
 * - Cost is calculated from line items total
 * 
 * Props:
 * - billingFrequency: Current billing frequency
 * - onBillingFrequencyChange: Callback for frequency changes
 * - disabled: Disable during submission
 */

'use client';

import { DollarSign } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';

interface JobBillingSectionProps {
  billingFrequency: string;
  taxRate: number;
  onBillingFrequencyChange: (value: string) => void;
  onTaxRateChange: (value: number) => void;
  disabled?: boolean;
}

export function JobBillingSection({
  billingFrequency,
  taxRate,
  onBillingFrequencyChange,
  onTaxRateChange,
  disabled
}: JobBillingSectionProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <DollarSign className="w-5 h-5 mr-2 text-brand" />
        Billing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Billing Frequency
          </label>
          <CustomSelect
            value={billingFrequency}
            onChange={onBillingFrequencyChange}
            disabled={disabled}
            options={[
              { value: 'AT_COMPLETION', label: 'At Completion' },
              { value: 'PER_VISIT', label: 'Per Visit' },
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="13"
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Total cost is calculated from line items
      </p>
    </div>
  );
}

