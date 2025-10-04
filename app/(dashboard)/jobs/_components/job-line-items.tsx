/**
 * JOB LINE ITEMS
 * 
 * Purpose:
 * Display and manage line items for jobs (from estimate conversions or manual entry)
 * Calculate and show pricing breakdown from line items
 */

'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { calculateFullPricing } from '@/lib/pricing-calculator';

export interface LineItem {
  id?: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  order: number;
}

interface JobLineItemsProps {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
  taxRate?: number; // Only tax rate needed - totals calculated from line items
  onTaxRateChange?: (value: number) => void;
}

export function JobLineItems({
  lineItems,
  onChange,
  disabled = false,
  taxRate = 13,
  onTaxRateChange,
}: JobLineItemsProps) {
  // Calculate pricing from line items
  const pricing = calculateFullPricing({
    lineItems,
    taxRate,
  });
  
  const hasPricing = lineItems.length > 0;

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      order: lineItems.length,
    };
    onChange([...lineItems, newItem]);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const updated = lineItems.map((item, i) => {
      if (i !== index) return item;
      
      const newItem = { ...item, ...updates };
      
      // Recalculate total
      newItem.total = newItem.quantity * newItem.unitPrice;
      
      return newItem;
    });
    
    onChange(updated);
  };

  const deleteLineItem = (index: number) => {
    onChange(lineItems.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Line Items {hasPricing && <span className="text-sm font-normal text-gray-500">(From Estimate)</span>}
        </h2>
        <button
          type="button"
          onClick={addLineItem}
          disabled={disabled}
          className="px-3 py-1.5 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </button>
      </div>

      {lineItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No line items yet. Click "Add Item" to add services or products.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                {/* Row 1: Main fields horizontal */}
                <div className="flex gap-3 items-start mb-3">
                  {/* Drag Handle */}
                  <div className="flex items-center justify-center pt-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLineItem(index, { name: e.target.value })}
                      placeholder="Service/Product name"
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Qty</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-28">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Total */}
                  <div className="w-28">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Total</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white pt-2">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="flex items-center justify-end pt-7">
                    <button
                      type="button"
                      onClick={() => deleteLineItem(index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Description full width below */}
                <div className="pl-7">
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => updateLineItem(index, { description: e.target.value })}
                    placeholder="Description (optional)"
                    disabled={disabled}
                    className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary - if converted from estimate */}
          {hasPricing && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col items-end space-y-2 text-sm">
                <div className="flex justify-between w-64">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${pricing.subtotal.toFixed(2)}</span>
                </div>
                
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between w-64">
                    <span className="text-gray-600 dark:text-gray-400">
                      Discount {pricing.discountType === 'percentage' && pricing.discountValue ? `(${pricing.discountValue}%)` : ''}:
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">-${pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {pricing.taxAmount > 0 && (
                  <div className="flex justify-between w-64">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax ({pricing.taxRate}%):
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">${pricing.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between w-64 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-brand">${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

