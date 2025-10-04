/**
 * JOB DETAILS SECTION COMPONENT
 * 
 * Purpose:
 * Form section for job title and description fields.
 * 
 * Props:
 * - title: Current job title
 * - description: Current job description
 * - onTitleChange: Callback for title updates
 * - onDescriptionChange: Callback for description updates
 * - disabled: Disable inputs during submission
 */

'use client';

import { Briefcase } from 'lucide-react';

interface JobDetailsSectionProps {
  title: string | null;
  description: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDetailsSection({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange, 
  disabled 
}: JobDetailsSectionProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Briefcase className="w-5 h-5 mr-2 text-brand" />
        Job Details
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Weekly Pool Cleaning (optional - will use client name if empty)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Add details, special instructions, or notes..."
          />
        </div>
      </div>
    </div>
  );
}

