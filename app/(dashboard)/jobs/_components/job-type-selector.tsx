/**
 * JOB TYPE SELECTOR COMPONENT
 * 
 * Purpose:
 * Allows user to select between one-off and recurring job types.
 * Shows as selectable cards in create mode, read-only banner in edit mode.
 * 
 * Props:
 * - value: Current job type selection
 * - onChange: Callback when type changes
 * - disabled: Disable interaction
 * - isEditMode: Show read-only view if editing
 */

'use client';

import { Calendar, Repeat } from 'lucide-react';

interface JobTypeSelectorProps {
  value: 'oneoff' | 'recurring';
  onChange: (value: 'oneoff' | 'recurring') => void;
  disabled?: boolean;
  isEditMode?: boolean;
}

export function JobTypeSelector({ value, onChange, disabled, isEditMode }: JobTypeSelectorProps) {
  if (isEditMode) {
    return (
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Job Type</h2>
        <div className="bg-gray-100 dark:bg-gray-700 border border-brand-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {value === 'recurring' ? (
              <>
                <Repeat className="w-6 h-6 text-brand" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Recurring Job</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Job type cannot be changed after creation</div>
                </div>
              </>
            ) : (
              <>
                <Calendar className="w-6 h-6 text-brand" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">One-Off Job</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Job type cannot be changed after creation</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Job Type</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('oneoff')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            value === 'oneoff'
              ? 'border-brand bg-brand/5 dark:bg-brand/10'
              : 'border-brand-border hover:border-brand-border-hover'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Calendar className={`w-6 h-6 mb-2 ${value === 'oneoff' ? 'text-brand' : 'text-gray-400'}`} />
          <div className="font-semibold text-gray-900 dark:text-white">One-Off Job</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Single visit or non-repeating</div>
        </button>
        
        <button
          type="button"
          onClick={() => onChange('recurring')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            value === 'recurring'
              ? 'border-brand bg-brand/5 dark:bg-brand/10'
              : 'border-brand-border hover:border-brand-border-hover'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Repeat className={`w-6 h-6 mb-2 ${value === 'recurring' ? 'text-brand' : 'text-gray-400'}`} />
          <div className="font-semibold text-gray-900 dark:text-white">Recurring Job</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Repeating schedule</div>
        </button>
      </div>
    </div>
  );
}

