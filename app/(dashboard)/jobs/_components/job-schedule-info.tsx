/**
 * JOB SCHEDULE INFO COMPONENT
 * 
 * Displays job schedule information: start date, time, duration, recurring pattern
 */

'use client';

import { Calendar, Clock, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { formatDuration, calculateEndTime } from '@/lib/time-utils';

interface JobScheduleInfoProps {
  job: {
    startDate: Date | string | null;
    startTime: string | null;
    duration: number;
    isRecurring: boolean;
    recurringPattern: string | null;
    recurringDays: any;
    recurringEndDate: Date | string | null;
  };
}

export function JobScheduleInfo({ job }: JobScheduleInfoProps) {
  // Calculate end time from start time and duration
  const calculateEndTimeDisplay = () => {
    if (!job.startTime) return 'Not set';
    
    try {
      // Parse time string (e.g., "14:00")
      const [hours, minutes] = job.startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + job.duration;
      
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      
      // Format as 12-hour time
      const period = endHours >= 12 ? 'PM' : 'AM';
      const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
      
      return `${displayHours}:${endMins.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return 'Not set';
    }
  };

  const formatStartTime = () => {
    if (!job.startTime) return 'Not set';
    
    try {
      const [hours, minutes] = job.startTime.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return 'Not set';
    }
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold text-brand-text mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-brand" />
        Schedule
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Start Date */}
        <div className="bg-brand-bg-secondary rounded-lg p-4">
          <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Start Date</p>
          <p className="font-semibold text-brand-text">
            {job.startDate ? format(new Date(job.startDate), 'MMM d, yyyy') : 'Not set'}
          </p>
        </div>

        {/* Start Time */}
        <div className="bg-brand-bg-secondary rounded-lg p-4">
          <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Start Time
          </p>
          <p className="font-semibold text-brand-text">
            {formatStartTime()}
          </p>
        </div>

        {/* Duration */}
        <div className="bg-brand-bg-secondary rounded-lg p-4">
          <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Duration</p>
          <span className="inline-flex items-center px-2.5 py-1 bg-brand/10 text-brand rounded-full text-sm font-semibold">
            {formatDuration(job.duration)}
          </span>
        </div>

        {/* End Time */}
        <div className="bg-brand-bg-secondary rounded-lg p-4">
          <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">End Time</p>
          <p className="font-semibold text-brand-text">
            {calculateEndTimeDisplay()}
          </p>
        </div>
      </div>

      {/* Recurring Info */}
      {job.isRecurring && (
        <div className="mt-4 p-4 bg-brand-bg-tertiary border-l-4 border-l-brand rounded-lg">
          <div className="flex items-center space-x-2">
            <Repeat className="w-5 h-5 text-brand" />
            <p className="text-sm font-medium text-brand-text">
              <strong>Recurring Schedule:</strong> {job.recurringPattern?.toUpperCase()}
              {job.recurringDays && Array.isArray(job.recurringDays) && job.recurringDays.length > 0 && (
                <span> on {(job.recurringDays as number[]).map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</span>
              )}
              {job.recurringEndDate && <span> • Ends {format(new Date(job.recurringEndDate), 'MMM d, yyyy')}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

