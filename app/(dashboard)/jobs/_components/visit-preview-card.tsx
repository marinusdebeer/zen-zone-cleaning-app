/**
 * VISIT PREVIEW CARD COMPONENT
 * 
 * Purpose:
 * Shows preview of visits that will be generated for a recurring job.
 * Displays total count and first few visit dates.
 * 
 * Features:
 * - Shows total visit count
 * - Lists first 5 visit dates
 * - Indicates if more visits will be created
 * - Only shown in create mode (not edit)
 * 
 * Props:
 * - visitCount: Total number of visits to be generated
 * - visitPreview: Array of Date objects for first few visits
 */

'use client';

import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface VisitPreviewCardProps {
  visitCount: number;
  visitPreview: Date[];
}

export function VisitPreviewCard({ visitCount, visitPreview }: VisitPreviewCardProps) {
  if (visitCount === 0) return null;

  return (
    <div className="bg-brand-bg-tertiary border-2 border-brand rounded-xl p-5 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-10 h-10 bg-brand rounded-lg flex items-center justify-center mr-4 shadow-md">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-brand-text mb-1">
            {visitCount} visit{visitCount > 1 ? 's' : ''} will be created
          </div>
          {visitPreview.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold text-brand-text-secondary mb-2">
                First visits:
              </div>
              <ul className="space-y-1.5">
                {visitPreview.map((date, i) => (
                  <li key={i} className="flex items-center text-sm text-brand-text-secondary">
                    <svg className="w-4 h-4 text-brand mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="3" />
                    </svg>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </li>
                ))}
              </ul>
              {visitCount > 5 && (
                <div className="text-sm text-brand font-medium mt-3 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {visitCount - 5} more visit{visitCount - 5 > 1 ? 's' : ''}...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

