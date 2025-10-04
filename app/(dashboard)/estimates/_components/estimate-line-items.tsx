/**
 * ESTIMATE LINE ITEMS
 * 
 * Purpose:
 * Manage line items (services/products) with pricing
 * Add, edit, delete, reorder line items
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: number;
}

interface EstimateLineItemsProps {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export function EstimateLineItems({
  lineItems,
  onChange,
  disabled = false,
}: EstimateLineItemsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      quantity: '1',
      unitPrice: '0',
      total: 0,
    };
    onChange([...lineItems, newItem]);
    setEditingId(newItem.id);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    const updated = lineItems.map(item => {
      if (item.id !== id) return item;
      
      const newItem = { ...item, ...updates };
      
      // Recalculate total
      const qty = parseFloat(newItem.quantity) || 0;
      const price = parseFloat(newItem.unitPrice) || 0;
      newItem.total = qty * price;
      
      return newItem;
    });
    
    onChange(updated);
  };

  const deleteLineItem = (id: string) => {
    onChange(lineItems.filter(item => item.id !== id));
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
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
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="grid grid-cols-12 gap-3 items-start">
                {/* Drag Handle */}
                <div className="col-span-1 flex items-center justify-center pt-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                </div>

                {/* Name & Description */}
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                    placeholder="Service/Product name"
                    disabled={disabled}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                    placeholder="Description (optional)"
                    disabled={disabled}
                    className="w-full mt-2 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, { quantity: e.target.value })}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, { unitPrice: e.target.value })}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Total */}
                <div className="col-span-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Total</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white pt-1.5">
                    ${item.total.toFixed(2)}
                  </div>
                </div>

                {/* Delete */}
                <div className="col-span-1 flex items-center justify-end pt-6">
                  <button
                    type="button"
                    onClick={() => deleteLineItem(item.id)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

