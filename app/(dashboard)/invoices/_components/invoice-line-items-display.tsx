/**
 * INVOICE LINE ITEMS DISPLAY
 * 
 * Purpose:
 * Display line items from job or manual entry
 */

'use client';

import { FileText } from 'lucide-react';

interface LineItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceLineItemsDisplayProps {
  lineItems: LineItem[];
  subtotal: string;
  onSubtotalChange: (value: string) => void;
  fromJob: boolean;
  disabled?: boolean;
}

export function InvoiceLineItemsDisplay({
  lineItems,
  subtotal,
  onSubtotalChange,
  fromJob,
  disabled = false,
}: InvoiceLineItemsDisplayProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-brand" />
        Line Items
      </h2>

      {fromJob && lineItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Item</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Price</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtotal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={subtotal}
              onChange={(e) => onSubtotalChange(e.target.value)}
              disabled={disabled}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="0.00"
            />
          </div>
        </div>
      )}
    </div>
  );
}

