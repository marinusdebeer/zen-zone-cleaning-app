/**
 * JOB DETAIL HEADER COMPONENT
 * 
 * Shows job title/client name, status badge, and action buttons
 */

'use client';

import Link from 'next/link';
import { User, MapPin, Repeat } from 'lucide-react';
import { getClientDisplayName } from '@/lib/client-utils';
import { format } from 'date-fns';
import { JobActions } from '../[id]/job-actions';

interface JobDetailHeaderProps {
  job: {
    id: string;
    number?: number;
    title: string | null;
    isRecurring: boolean;
    client: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      companyName?: string | null;
    };
  };
  orgId: string;
}

export function JobDetailHeader({ job, orgId }: JobDetailHeaderProps) {
  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 flex-wrap">
            <h1 className="text-3xl font-bold text-brand-text">{job.title || getClientDisplayName(job.client)}</h1>
            {job.isRecurring && (
              <span className="flex items-center px-3 py-1.5 bg-brand/10 text-brand rounded-full text-sm font-semibold">
                <Repeat className="w-4 h-4 mr-1.5" />
                Recurring
              </span>
            )}
          </div>
          {job.number && (
            <p className="text-sm text-brand-text-secondary mt-2">
              Job #{job.number}
            </p>
          )}
        </div>

        <JobActions jobId={job.id} orgId={orgId} />
      </div>

      {/* Client Info */}
      <div className="flex items-center space-x-4">
        <Link 
          href={`/clients/${job.client.id}`}
          className="inline-flex items-center text-brand-text-secondary hover:text-brand transition-colors"
        >
          <User className="w-4 h-4 mr-2" />
          {getClientDisplayName(job.client)}
        </Link>
      </div>
    </div>
  );
}

