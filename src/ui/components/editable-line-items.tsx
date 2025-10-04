/**
 * EDITABLE LINE ITEMS COMPONENT
 * 
 * Purpose:
 * Reusable component for displaying and editing line items inline.
 * Used across estimates, jobs, and invoices for consistency.
 * 
 * Features:
 * - Click row to edit
 * - Click outside to cancel
 * - Add new items
 * - Delete items
 * - Auto-calculate totals
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Package, Plus, Trash2, Check, X } from 'lucide-react';

export interface LineItem {
  id?: string;
  name: string;
  description: string | null;
  quantity: number | string;
  unitPrice: number | string;
  total?: number | string;
  order: number;
}

interface EditableLineItemsProps {
  items: LineItem[];
  taxRate?: number;
  onUpdate: (items: LineItem[]) => Promise<void>;
  disabled?: boolean;
  entityType?: 'estimate' | 'job' | 'invoice';
}

export function EditableLineItems({
  items,
  taxRate = 13,
  onUpdate,
  disabled = false,
  entityType = 'job'
}: EditableLineItemsProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<LineItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingId && tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setEditingId(null);
        setEditingData(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingId]);

  const handleRowClick = (item: LineItem) => {
    if (disabled || isSaving) return;
    setEditingId(item.id || 'new');
    setEditingData({ ...item });
  };

  const handleSave = async () => {
    if (!editingData) return;

    setIsSaving(true);
    try {
      const updatedItems = editingData.id
        ? lineItems.map(item => item.id === editingData.id ? editingData : item)
        : [...lineItems, { ...editingData, id: Date.now().toString(), order: lineItems.length }];

      await onUpdate(updatedItems);
      setLineItems(updatedItems);
      setEditingId(null);
      setEditingData(null);
    } catch (error) {
      console.error('Failed to save line item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this line item?')) return;

    setIsSaving(true);
    try {
      const updatedItems = lineItems.filter(item => item.id !== itemId);
      await onUpdate(updatedItems);
      setLineItems(updatedItems);
    } catch (error) {
      console.error('Failed to delete line item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      order: lineItems.length
    };
    setEditingId('new');
    setEditingData(newItem);
  };

  const updateEditingData = (field: keyof LineItem, value: any) => {
    if (!editingData) return;
    setEditingData({ ...editingData, [field]: value });
  };

  const calculateItemTotal = (qty: number | string, price: number | string) => {
    return (Number(qty) || 0) * (Number(price) || 0);
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm border border-brand-border overflow-hidden">
      <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
        <h3 className="text-lg font-semibold text-brand-text flex items-center">
          <Package className="w-5 h-5 mr-2 text-brand" />
          Line Items ({lineItems.length})
        </h3>
        <button
          onClick={handleAddItem}
          disabled={disabled || isSaving || editingId !== null}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm inline-flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Item
        </button>
      </div>

      <div ref={tableRef} className="overflow-x-auto">
        {lineItems.length > 0 || editingId === 'new' ? (
          <table className="w-full">
            <thead className="bg-brand-bg-secondary sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-brand-text uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-text uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-text uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {lineItems.map((item) => {
                const isEditing = editingId === item.id;
                const itemTotal = calculateItemTotal(item.quantity, item.unitPrice);

                return (
                  <tr
                    key={item.id}
                    onClick={() => !isEditing && handleRowClick(item)}
                    className={`transition-colors ${
                      isEditing
                        ? 'bg-brand-bg-tertiary'
                        : 'hover:bg-brand-bg-secondary cursor-pointer'
                    }`}
                  >
                    {isEditing && editingData ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData.name}
                            onChange={(e) => updateEditingData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                            placeholder="Item name"
                            autoFocus
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData.description || ''}
                            onChange={(e) => updateEditingData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                            placeholder="Description (optional)"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editingData.quantity}
                            onChange={(e) => updateEditingData('quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-center focus:ring-2 focus:ring-brand/20"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editingData.unitPrice}
                            onChange={(e) => updateEditingData('unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-right focus:ring-2 focus:ring-brand/20"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-sm font-medium text-brand-text">
                              ${calculateItemTotal(editingData.quantity, editingData.unitPrice).toFixed(2)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave();
                              }}
                              disabled={isSaving || !editingData.name}
                              className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel();
                              }}
                              disabled={isSaving}
                              className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {item.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id!);
                                }}
                                disabled={isSaving}
                                className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-brand-text">{item.name}</p>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          {item.description ? (
                            <p className="text-sm text-brand-text-secondary">{item.description}</p>
                          ) : (
                            <p className="text-sm text-brand-text-tertiary italic">No description</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-brand-text">{item.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-brand-text">${Number(item.unitPrice).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-brand-text">${itemTotal.toFixed(2)}</span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}

              {/* New item row */}
              {editingId === 'new' && editingData && (
                <tr className="bg-brand-bg-tertiary">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingData.name}
                      onChange={(e) => updateEditingData('name', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                      placeholder="Item name"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingData.description || ''}
                      onChange={(e) => updateEditingData('description', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                      placeholder="Description (optional)"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={editingData.quantity}
                      onChange={(e) => updateEditingData('quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-center focus:ring-2 focus:ring-brand/20"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={editingData.unitPrice}
                      onChange={(e) => updateEditingData('unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-right focus:ring-2 focus:ring-brand/20"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium text-brand-text">
                        ${calculateItemTotal(editingData.quantity, editingData.unitPrice).toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        disabled={isSaving || !editingData.name}
                        className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        disabled={isSaving}
                        className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Totals */}
              <tr className="bg-brand-bg-secondary font-semibold">
                <td colSpan={4} className="px-6 py-4 text-sm text-brand-text text-right">Subtotal:</td>
                <td className="px-6 py-4 text-sm text-brand text-right">${subtotal.toFixed(2)}</td>
              </tr>
              <tr className="bg-brand-bg-secondary">
                <td colSpan={4} className="px-6 py-3 text-sm text-brand-text-secondary text-right">Tax ({taxRate}%):</td>
                <td className="px-6 py-3 text-sm text-brand-text-secondary text-right">${taxAmount.toFixed(2)}</td>
              </tr>
              <tr className="bg-brand-bg-secondary font-bold text-lg">
                <td colSpan={4} className="px-6 py-4 text-brand-text text-right">Total:</td>
                <td className="px-6 py-4 text-brand text-right">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-brand-text-tertiary mx-auto mb-3" />
            <p className="text-brand-text-secondary mb-4">No line items yet</p>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

