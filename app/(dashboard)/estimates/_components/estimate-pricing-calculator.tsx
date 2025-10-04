/**
 * ESTIMATE PRICING CALCULATOR
 * 
 * Purpose:
 * Calculate and display pricing breakdown
 * Handles tax, discounts, and deposits
 */

'use client';

import { Calculator } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';

interface PricingCalculatorProps {
  subtotal: number;
  taxRate: string;
  discountType: string;
  discountValue: string;
  depositRequired: boolean;
  depositType: string;
  depositValue: string;
  onTaxRateChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onDiscountValueChange: (value: string) => void;
  onDepositRequiredChange: (value: boolean) => void;
  onDepositTypeChange: (value: string) => void;
  onDepositValueChange: (value: string) => void;
  disabled?: boolean;
}

export function EstimatePricingCalculator({
  subtotal,
  taxRate,
  discountType,
  discountValue,
  depositRequired,
  depositType,
  depositValue,
  onTaxRateChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDepositRequiredChange,
  onDepositTypeChange,
  onDepositValueChange,
  disabled = false,
}: PricingCalculatorProps) {
  // Calculations
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  
  const discountAmount = discountType === 'percentage'
    ? subtotal * (parseFloat(discountValue || '0') / 100)
    : parseFloat(discountValue || '0');
  
  const total = subtotal + taxAmount - discountAmount;
  
  const depositAmount = depositRequired
    ? depositType === 'percentage'
      ? total * (parseFloat(depositValue || '0') / 100)
      : parseFloat(depositValue || '0')
    : 0;

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Calculator className="w-5 h-5 mr-2 text-brand" />
        Pricing
      </h2>

      <div className="space-y-4">
        {/* Subtotal (Read-only) */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
          <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Tax Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400 pb-2">
              Tax: ${taxAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discount (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <CustomSelect
              value={discountType}
              onChange={onDiscountTypeChange}
              disabled={disabled}
              options={[
                { value: 'none', label: 'No Discount' },
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
              placeholder="Type"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              disabled={disabled || discountType === 'none'}
              placeholder={discountType === 'percentage' ? '%' : '$'}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              -${discountAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t-2 border-brand">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-bold text-brand">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Deposit */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={depositRequired}
              onChange={(e) => onDepositRequiredChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-brand border-gray-300 dark:border-gray-600 rounded focus:ring-brand"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Require Deposit
            </span>
          </label>

          {depositRequired && (
            <div className="grid grid-cols-3 gap-3 ml-6">
              <CustomSelect
                value={depositType}
                onChange={onDepositTypeChange}
                disabled={disabled}
                options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'fixed', label: 'Fixed Amount' },
                ]}
                placeholder="Type"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositValue}
                onChange={(e) => onDepositValueChange(e.target.value)}
                disabled={disabled}
                placeholder={depositType === 'percentage' ? '%' : '$'}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex items-center text-sm font-semibold text-brand">
                ${depositAmount.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

