/**
 * EDITABLE EXPENSES COMPONENT
 * 
 * Purpose:
 * Reusable component for displaying and editing expenses inline.
 * Used for jobs and any other entity that tracks expenses.
 * 
 * Features:
 * - Click row to edit
 * - Click outside to cancel
 * - Add new expenses
 * - Delete expenses
 * - Track expense details
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export interface Expense {
  id?: string;
  date: Date | string;
  category: string;
  description: string | null;
  amount: number | string;
  receipt?: string | null;
}

interface EditableExpensesProps {
  expenses: Expense[];
  onUpdate: (expenses: Expense[]) => Promise<void>;
  disabled?: boolean;
}

export function EditableExpenses({
  expenses,
  onUpdate,
  disabled = false
}: EditableExpensesProps) {
  const [expenseList, setExpenseList] = useState<Expense[]>(expenses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculate total
  const totalExpenses = expenseList.reduce((sum, exp) => {
    return sum + (Number(exp.amount) || 0);
  }, 0);

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

  const handleRowClick = (expense: Expense) => {
    if (disabled || isSaving) return;
    setEditingId(expense.id || 'new');
    setEditingData({ ...expense });
  };

  const handleSave = async () => {
    if (!editingData) return;

    setIsSaving(true);
    try {
      const updatedExpenses = editingData.id
        ? expenseList.map(exp => exp.id === editingData.id ? editingData : exp)
        : [...expenseList, { ...editingData, id: Date.now().toString() }];

      await onUpdate(updatedExpenses);
      setExpenseList(updatedExpenses);
      setEditingId(null);
      setEditingData(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;

    setIsSaving(true);
    try {
      const updatedExpenses = expenseList.filter(exp => exp.id !== expenseId);
      await onUpdate(updatedExpenses);
      setExpenseList(updatedExpenses);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExpense = () => {
    const newExpense: Expense = {
      date: new Date().toISOString().split('T')[0],
      category: 'Materials',
      description: '',
      amount: 0
    };
    setEditingId('new');
    setEditingData(newExpense);
  };

  const updateEditingData = (field: keyof Expense, value: any) => {
    if (!editingData) return;
    setEditingData({ ...editingData, [field]: value });
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm border border-brand-border overflow-hidden">
      <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg">
        <h3 className="text-lg font-semibold text-brand-text flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-brand" />
          Expenses ({expenseList.length})
        </h3>
        <button
          onClick={handleAddExpense}
          disabled={disabled || isSaving || editingId !== null}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm inline-flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Expense
        </button>
      </div>

      <div ref={tableRef} className="overflow-x-auto">
        {expenseList.length > 0 || editingId === 'new' ? (
          <table className="w-full">
            <thead className="bg-brand-bg-secondary sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-text uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {expenseList.map((expense) => {
                const isEditing = editingId === expense.id;

                return (
                  <tr
                    key={expense.id}
                    onClick={() => !isEditing && handleRowClick(expense)}
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
                            type="date"
                            value={typeof editingData.date === 'string' ? editingData.date : format(new Date(editingData.date), 'yyyy-MM-dd')}
                            onChange={(e) => updateEditingData('date', e.target.value)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                            autoFocus
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editingData.category}
                            onChange={(e) => updateEditingData('category', e.target.value)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                          >
                            <option value="Materials">Materials</option>
                            <option value="Labor">Labor</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Travel">Travel</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingData.description || ''}
                            onChange={(e) => updateEditingData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                            placeholder="Description"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <input
                              type="number"
                              value={editingData.amount}
                              onChange={(e) => updateEditingData('amount', parseFloat(e.target.value) || 0)}
                              className="w-32 px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-right focus:ring-2 focus:ring-brand/20"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave();
                              }}
                              disabled={isSaving}
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
                            {expense.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(expense.id!);
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
                          <p className="text-sm text-brand-text">
                            {typeof expense.date === 'string' 
                              ? format(new Date(expense.date), 'MMM d, yyyy')
                              : format(expense.date, 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-bg-tertiary text-brand-text">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          {expense.description ? (
                            <p className="text-sm text-brand-text-secondary">{expense.description}</p>
                          ) : (
                            <p className="text-sm text-brand-text-tertiary italic">No description</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            ${Number(expense.amount).toFixed(2)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}

              {/* New expense row */}
              {editingId === 'new' && editingData && (
                <tr className="bg-brand-bg-tertiary">
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={typeof editingData.date === 'string' ? editingData.date : format(new Date(editingData.date), 'yyyy-MM-dd')}
                      onChange={(e) => updateEditingData('date', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={editingData.category}
                      onChange={(e) => updateEditingData('category', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="Materials">Materials</option>
                      <option value="Labor">Labor</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editingData.description || ''}
                      onChange={(e) => updateEditingData('description', e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand/20"
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <input
                        type="number"
                        value={editingData.amount}
                        onChange={(e) => updateEditingData('amount', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-text text-right focus:ring-2 focus:ring-brand/20"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        disabled={isSaving}
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

              {/* Total */}
              <tr className="bg-brand-bg-secondary font-semibold">
                <td colSpan={3} className="px-6 py-4 text-sm text-brand-text text-right">Total Expenses:</td>
                <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 text-right font-bold">
                  ${totalExpenses.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-brand-text-tertiary mx-auto mb-3" />
            <p className="text-brand-text-secondary mb-4">No expenses yet</p>
            <button
              onClick={handleAddExpense}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm"
            >
              Add First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

