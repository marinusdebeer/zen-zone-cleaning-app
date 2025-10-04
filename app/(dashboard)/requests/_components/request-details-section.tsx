/**
 * REQUEST DETAILS SECTION
 * 
 * Purpose:
 * Title, description, urgency, source fields
 */

'use client';

import { FileText, AlertCircle, Globe } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';

interface RequestDetailsSectionProps {
  title: string;
  description: string;
  source: string;
  urgency: string;
  notes: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

export function RequestDetailsSection({
  title,
  description,
  source,
  urgency,
  notes,
  onTitleChange,
  onDescriptionChange,
  onSourceChange,
  onUrgencyChange,
  onNotesChange,
  disabled = false,
}: RequestDetailsSectionProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-brand" />
        Request Details
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="What does the customer need?"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="Additional details about the request..."
          />
        </div>

        {/* Source and Urgency in grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Source
            </label>
            <CustomSelect
              value={source}
              onChange={onSourceChange}
              disabled={disabled}
              options={[
                { value: 'website', label: 'Website' },
                { value: 'phone', label: 'Phone Call' },
                { value: 'email', label: 'Email' },
                { value: 'referral', label: 'Referral' },
                { value: 'social', label: 'Social Media' },
                { value: 'walk-in', label: 'Walk-in' },
              ]}
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Urgency
            </label>
            <CustomSelect
              value={urgency}
              onChange={onUrgencyChange}
              disabled={disabled}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Internal Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            placeholder="Internal notes (not visible to client)..."
          />
        </div>
      </div>
    </div>
  );
}

