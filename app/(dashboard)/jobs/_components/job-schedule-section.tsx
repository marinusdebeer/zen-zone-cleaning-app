/**
 * JOB SCHEDULE SECTION COMPONENT
 * 
 * Purpose:
 * Form section for job scheduling including date, time, and recurring patterns.
 * Handles both one-off and recurring job scheduling options.
 * 
 * Features:
 * - Start date and time selection
 * - Recurring pattern selection (daily, weekly, biweekly, monthly)
 * - Day of week selection for weekly patterns
 * - End date for recurring jobs
 * - Edit mode warning for changing recurring settings
 * 
 * Props:
 * - jobType: 'oneoff' or 'recurring'
 * - All scheduling-related form values
 * - Change callbacks for each field
 * - disabled: Disable during submission
 * - isEditMode: Show warning in edit mode
 */

'use client';

import { Calendar, Repeat, AlertCircle, Clock } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';
import { formatDuration, calculateEndTime } from '@/lib/time-utils';
import { format } from 'date-fns';

interface JobScheduleSectionProps {
  jobType: 'oneoff' | 'recurring';
  startDate: string;
  startTime: string;
  duration: number;
  recurringPattern: string;
  recurringDays: number[];
  recurringEndDate: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onPatternChange: (value: string) => void;
  onDaysChange: (days: number[]) => void;
  onEndDateChange: (value: string) => void;
  disabled?: boolean;
  isEditMode?: boolean;
}

export function JobScheduleSection({
  jobType,
  startDate,
  startTime,
  duration,
  recurringPattern,
  recurringDays,
  recurringEndDate,
  onStartDateChange,
  onStartTimeChange,
  onDurationChange,
  onPatternChange,
  onDaysChange,
  onEndDateChange,
  disabled,
  isEditMode
}: JobScheduleSectionProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate end time for display
  const endTime = startDate && startTime ? (() => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = calculateEndTime(start, duration);
    return format(end, 'h:mm a');
  })() : null;

  const toggleDay = (day: number) => {
    const newDays = recurringDays.includes(day)
      ? recurringDays.filter(d => d !== day)
      : [...recurringDays, day];
    onDaysChange(newDays);
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 mr-2 text-brand" />
          Schedule
        </h2>
        {jobType === 'recurring' && (
          <span className="text-xs font-medium px-3 py-1 bg-brand/10 text-brand rounded-full">
            Recurring Job
          </span>
        )}
      </div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              required
              disabled={disabled}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={duration}
              onChange={(e) => onDurationChange(parseInt(e.target.value) || 15)}
              disabled={disabled}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="120"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDuration(duration)}
            </p>
          </div>
        </div>
        
        {/* End Time Display */}
        {endTime && (
          <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-brand" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Visit will end at: <span className="font-semibold">{endTime}</span>
            </span>
          </div>
        )}

        {jobType === 'recurring' && (
          <div className="space-y-5 pt-5 border-t-2 border-brand-border">
            <div className="flex items-center gap-2 mb-1">
              <Repeat className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recurring Settings</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeat Pattern
              </label>
              <CustomSelect
                value={recurringPattern}
                onChange={onPatternChange}
                disabled={disabled}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'biweekly', label: 'Every 2 Weeks' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>

            {(recurringPattern === 'weekly' || recurringPattern === 'biweekly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Repeat On
                </label>
                <div className="flex flex-wrap gap-3">
                  {days.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      disabled={disabled}
                      className={`min-w-[80px] px-5 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                        recurringDays.includes(index)
                          ? 'bg-brand text-white shadow-md hover:bg-brand-dark ring-2 ring-brand/20'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={recurringEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                disabled={disabled}
                min={startDate}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Leave empty to generate visits for 5 years
              </p>
            </div>

            {isEditMode && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Changing recurring settings will not affect visits that have already been generated. 
                    To modify visits, edit them individually on the job detail page.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

