/**
 * INVOICE PRICING SECTION
 * 
 * Purpose:
 * Tax, discount calculation and display
 */

'use client';

import { DollarSign, Calendar } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';

interface InvoicePricingSectionProps {
  subtotal: number;
  taxRate: string;
  discountType: string;
  discountValue: string;
  taxAmount: number;
  discountAmount: number;
  total: number;
  dueDate: string;
  notes: string;
  onTaxRateChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onDiscountValueChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

export function InvoicePricingSection({
  subtotal,
  taxRate,
  discountType,
  discountValue,
  taxAmount,
  discountAmount,
  total,
  dueDate,
  notes,
  onTaxRateChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDueDateChange,
  onNotesChange,
  disabled = false,
}: InvoicePricingSectionProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-brand" />
        Pricing & Terms
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Tax Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => onTaxRateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="10.0"
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discount
          </label>
          <CustomSelect
            value={discountType}
            onChange={onDiscountTypeChange}
            disabled={disabled}
            options={[
              { value: 'none', label: 'No Discount' },
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed Amount' },
            ]}
          />
        </div>
      </div>

      {/* Discount Value */}
      {discountType !== 'none' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discount {discountType === 'percentage' ? '(%)' : 'Amount ($)'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={discountType === 'percentage' ? '100' : undefined}
            value={discountValue}
            onChange={(e) => onDiscountValueChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="0"
          />
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="space-y-2 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
        </div>
        {parseFloat(taxRate) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax ({taxRate}%)</span>
            <span className="text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discount</span>
            <span className="text-red-600 dark:text-red-400">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-brand">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Due Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Due Date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
          placeholder="Internal notes or payment terms..."
        />
      </div>
    </div>
  );
}

