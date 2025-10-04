/**
 * ESTIMATE DETAILS SECTION
 * 
 * Purpose:
 * Title and description fields for estimate
 */

'use client';

import { FileText } from 'lucide-react';

interface EstimateDetailsSectionProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function EstimateDetailsSection({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  disabled = false,
}: EstimateDetailsSectionProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-brand" />
        Estimate Details
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimate Title <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="e.g., Deep Cleaning Service"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="Detailed description of services to be provided..."
          />
        </div>
      </div>
    </div>
  );
}

