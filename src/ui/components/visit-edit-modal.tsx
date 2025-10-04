/**
 * VISIT EDIT MODAL COMPONENT
 * 
 * Purpose:
 * Reusable modal for editing visit details from anywhere in the app.
 * 
 * Features:
 * - Edit scheduled date and time
 * - Update visit status
 * - Manage team assignments
 * - Add/edit notes
 * - View visit line items (read-only)
 * 
 * Usage:
 * - Can be triggered from jobs page, schedule, calendar, etc.
 * - Auto-refreshes parent page on save
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  X, Calendar, Clock, Users, FileText, CheckCircle, 
  AlertCircle, Package, Save, Edit2, MapPin 
} from 'lucide-react';
import { format } from 'date-fns';
import { updateVisit, updateVisitStatus } from '@/server/actions/visits';
import { formatDuration } from '@/lib/time-utils';

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface VisitLineItem {
  id: string;
  name: string;
  quantity: number | string;
  unitPrice: number | string;
}

interface Visit {
  id: string;
  number?: number;
  scheduledAt: Date | string;
  completedAt: Date | string | null;
  status: string;
  notes: string | null;
  assignees: any;
  lineItems?: VisitLineItem[];
  job?: {
    id: string;
    number?: number;
    title: string | null;
    client: {
      name: string;
    };
    property?: {
      address: string;
    } | null;
  };
}

interface VisitEditModalProps {
  visit: Visit | null;
  isOpen: boolean;
  onClose: () => void;
  teamMembers?: TeamMember[];
}

const statusOptions = [
  { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'InProgress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'Canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' },
  { value: 'NoShow', label: 'No Show', color: 'bg-red-100 text-red-800' },
];

export function VisitEditModal({ visit, isOpen, onClose, teamMembers = [] }: VisitEditModalProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 120, // in minutes
    endTime: '',
    status: '',
    notes: '',
    assignees: [] as string[],
  });

  // Initialize form data when visit changes
  useEffect(() => {
    if (visit) {
      const scheduledAt = new Date(visit.scheduledAt);
      const duration = (visit as any).duration || 120; // Default 2 hours if not set
      const endDate = new Date(scheduledAt.getTime() + duration * 60 * 1000);
      
      setFormData({
        scheduledDate: format(scheduledAt, 'yyyy-MM-dd'),
        scheduledTime: format(scheduledAt, 'HH:mm'),
        duration,
        endTime: format(endDate, 'HH:mm'),
        status: visit.status,
        notes: visit.notes || '',
        assignees: Array.isArray(visit.assignees) ? visit.assignees : [],
      });
      setIsEditing(false); // Reset to view mode when visit changes
    }
  }, [visit]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Center modal on open
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, select, a, label')) {
      return; // Don't drag if clicking on interactive elements
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isOpen || !visit) return null;

  // Handle duration change - recalculate end time
  const handleDurationChange = (newDuration: number) => {
    const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const endDate = new Date(scheduledAt.getTime() + newDuration * 60 * 1000);
    setFormData({
      ...formData,
      duration: newDuration,
      endTime: format(endDate, 'HH:mm'),
    });
  };

  // Handle end time change - recalculate duration
  const handleEndTimeChange = (newEndTime: string) => {
    const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const endDate = new Date(`${formData.scheduledDate}T${newEndTime}`);
    const durationMinutes = Math.round((endDate.getTime() - scheduledAt.getTime()) / (60 * 1000));
    
    setFormData({
      ...formData,
      endTime: newEndTime,
      duration: durationMinutes > 0 ? durationMinutes : 15, // Min 15 minutes
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      await updateVisit({
        id: visit.id,
        scheduledAt,
        duration: formData.duration,
        status: formData.status,
        notes: formData.notes || undefined,
        assignees: formData.assignees,
      });

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: string) => {
    if (!visit) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      await updateVisitStatus(visit.id, status);
      
      // Update local form data AND visit object to reflect the change immediately
      setFormData({ ...formData, status });
      visit.status = status; // Update the visit object directly for immediate UI update
      
      router.refresh();
      // Don't close modal - just show success
      setError(''); // Clear any errors
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    if (formData.assignees.includes(userId)) {
      setFormData({
        ...formData,
        assignees: formData.assignees.filter(id => id !== userId),
      });
    } else {
      setFormData({
        ...formData,
        assignees: [...formData.assignees, userId],
      });
    }
  };

  const lineItemsTotal = (visit.lineItems || []).reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  return (
    <>
      {/* Backdrop - No blur, can't close by clicking */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Modal - Draggable */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-brand-bg rounded-xl shadow-2xl w-full max-w-3xl pointer-events-auto"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header - Draggable */}
          <div 
            className="bg-brand-bg border-b border-brand-border p-4 flex items-center justify-between cursor-grab active:cursor-grabbing rounded-t-xl"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {visit.job?.title || visit.job?.client.name || 'Visit'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {visit.number ? `Visit #${visit.number}` : 'Visit'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-brand-dark transition-colors inline-flex items-center"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Status & Quick Actions */}
            {!isEditing && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                  visit.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  visit.status === 'InProgress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  visit.status === 'Canceled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                  visit.status === 'NoShow' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                }`}>
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  {visit.status}
                </span>
                
                {/* Quick Status Change Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions
                    .filter(opt => opt.value !== visit.status)
                    .slice(0, 3) // Only show top 3 most common actions
                    .map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleQuickStatus(option.value)}
                        disabled={isSubmitting}
                        className="px-2.5 py-1 rounded text-xs font-medium transition-all bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                      >
                        {option.label}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Client, Job & Property - Compact Grid */}
            {visit.job && (
              <div className={`grid ${visit.job.property ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">CLIENT</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{visit.job.client.name}</p>
                </div>
                <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">JOB</p>
                  <Link 
                    href={`/jobs/${visit.job.id}`}
                    className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
                    onClick={() => onClose()}
                  >
                    #{visit.job.number || '—'}
                  </Link>
                </div>
                {visit.job.property && (
                  <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">PROPERTY</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{visit.job.property.address}</p>
                  </div>
                )}
              </div>
            )}

            {/* Schedule - View or Edit Mode */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-brand" />
                Schedule
              </h3>
              
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => handleDurationChange(parseInt(e.target.value) || 15)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(visit.scheduledAt), 'EEEE, MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {format(new Date(visit.scheduledAt), 'h:mm a')} - {formData.endTime}
                    <span className="ml-2 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded">
                      {formatDuration(formData.duration)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Team Assignment */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                <Users className="w-4 h-4 mr-1.5 text-brand" />
                {isEditing ? 'Assign Team' : 'Assigned Team'}
              </h3>
              
              {isEditing ? (
                // Edit Mode - Compact Checkboxes
                teamMembers.length > 0 ? (
                  <div className="space-y-1.5">
                    {teamMembers.map((member) => {
                      const isAssigned = formData.assignees.includes(member.user.id);
                      return (
                        <label
                          key={member.id}
                          className={`flex items-center p-2 rounded-lg border transition-all cursor-pointer ${
                            isAssigned
                              ? 'border-brand bg-brand/5 dark:bg-brand/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleAssigneeToggle(member.user.id)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand focus:ring-2"
                          />
                          <p className="ml-2.5 text-sm font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    No team members available
                  </p>
                )
              ) : (
                // View Mode - Display assigned team
                formData.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teamMembers
                      .filter(m => formData.assignees.includes(m.user.id))
                      .map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand/10 dark:bg-brand/20 border border-brand/30"
                        >
                          <Users className="w-3.5 h-3.5 text-brand mr-2" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    No team assigned yet
                  </p>
                )
              )}
            </div>

            {/* Notes - Compact */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-brand" />
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={isSubmitting}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Add notes..."
                />
              </div>
            ) : (
              visit.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-brand" />
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg whitespace-pre-wrap">
                    {visit.notes}
                  </p>
                </div>
              )
            )}

            {/* Line Items - Compact */}
            {visit.lineItems && visit.lineItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                  <Package className="w-4 h-4 mr-1.5 text-brand" />
                  Line Items
                </h3>
                <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-1.5 text-left font-semibold text-gray-700 dark:text-gray-300">Item</th>
                        <th className="px-3 py-1.5 text-center font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                        <th className="px-3 py-1.5 text-right font-semibold text-gray-700 dark:text-gray-300">Price</th>
                        <th className="px-3 py-1.5 text-right font-semibold text-gray-700 dark:text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {visit.lineItems.map((item) => {
                        const qty = Number(item.quantity) || 0;
                        const price = Number(item.unitPrice) || 0;
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2 text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-center">{qty}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-right">${price.toFixed(2)}</td>
                            <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-right">
                              ${(qty * price).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 dark:bg-gray-800 font-semibold">
                        <td colSpan={3} className="px-3 py-2 text-gray-900 dark:text-white text-right">
                          Total:
                        </td>
                        <td className="px-3 py-2 text-brand text-right">
                          ${lineItemsTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-brand-bg border-t border-brand-border p-4 flex items-center justify-between rounded-b-xl">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    if (visit) {
                      const scheduledAt = new Date(visit.scheduledAt);
                      setFormData({
                        scheduledDate: format(scheduledAt, 'yyyy-MM-dd'),
                        scheduledTime: format(scheduledAt, 'HH:mm'),
                        status: visit.status,
                        notes: visit.notes || '',
                        assignees: Array.isArray(visit.assignees) ? visit.assignees : [],
                      });
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting || !formData.scheduledDate || !formData.scheduledTime}
                  className="px-6 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

