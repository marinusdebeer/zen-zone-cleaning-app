/**
 * JOB DETAIL CLIENT COMPONENT
 * 
 * Modular design using focused sub-components
 * Each section is now a separate, reusable component
 */

'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { JobDetailHeader } from '../_components/job-detail-header';
import { JobScheduleInfo } from '../_components/job-schedule-info';
import { JobTeamAssignment } from '../_components/job-team-assignment';
import { JobLineItemsSection } from '../_components/job-line-items-section';
import { JobExpensesSection } from '../_components/job-expenses-section';
import { JobVisitsSection } from '../_components/job-visits-section';
import { JobInvoicesSection } from '../_components/job-invoices-section';

// Type definitions
interface TeamMember {
  id: string;
  user: {
  id: string;
    name: string;
    email: string;
  };
}

interface Job {
  id: string;
  number?: number;
  title: string | null;
  description: string | null;
  status: string;
  priority: string;
  isRecurring: boolean;
  recurringPattern: string | null;
  recurringDays: any;
  startDate: Date | string | null;
  startTime: string | null;
  duration: number;
  recurringEndDate: Date | string | null;
  billingFrequency: string;
  assignees: any;
  taxRate: number;
  client: {
    id: string;
    name: string;
  };
  property: {
    id: string;
    address: string;
  } | null;
  visits: any[];
  lineItems: any[];
  expenses: any[];
  invoices: any[];
}

interface JobDetailClientProps {
  job: Job;
  orgId: string;
  teamMembers: TeamMember[];
}

export function JobDetailClient({ job: initialJob, orgId, teamMembers }: JobDetailClientProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-brand-text-secondary">
        <Link href="/jobs" className="hover:text-brand">Jobs</Link>
        <span>/</span>
        <span className="text-brand-text font-medium">{initialJob.title || initialJob.client.name}</span>
      </div>

      {/* Header with title, status, and actions */}
      <JobDetailHeader 
        job={{
          id: initialJob.id,
          number: initialJob.number,
          title: initialJob.title,
          isRecurring: initialJob.isRecurring,
          client: initialJob.client
        }}
        orgId={orgId}
      />

      {/* Key Info Cards */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Client */}
          <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
            <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Client</p>
            <Link href={`/clients/${initialJob.client.id}`} className="font-semibold text-brand-text hover:text-brand flex items-center">
              {initialJob.client.name}
            </Link>
          </div>
          
          {/* Property */}
          {initialJob.property && (
            <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
              <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Property</p>
              <p className="font-semibold text-brand-text flex items-center">
                <MapPin className="w-4 h-4 mr-1.5" />
                {initialJob.property.address}
              </p>
            </div>
          )}
          
          {/* Status */}
          <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
            <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Status</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              initialJob.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              initialJob.status === 'InProgress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
              initialJob.status === 'Scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {initialJob.status}
            </span>
          </div>

          {/* Priority */}
            <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
            <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Priority</p>
            <p className="font-semibold text-brand-text capitalize">{initialJob.priority}</p>
          </div>
            </div>
          
        {/* Billing & Description */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
            <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Billing Frequency</p>
            <p className="font-semibold text-brand-text">
              {initialJob.billingFrequency.replace('_', ' ')}
            </p>
          </div>
          
          {initialJob.description && (
            <div className="p-4 bg-brand-bg-secondary rounded-lg border border-brand-border">
              <p className="text-xs font-medium text-brand-text-secondary mb-1.5 uppercase tracking-wide">Description</p>
              <p className="text-sm text-brand-text-secondary">{initialJob.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Information */}
      <JobScheduleInfo job={initialJob} />

      {/* Team Assignment */}
      <JobTeamAssignment
        jobId={initialJob.id}
        assignees={Array.isArray(initialJob.assignees) ? initialJob.assignees : []}
        teamMembers={teamMembers}
        isRecurring={initialJob.isRecurring}
      />

      {/* Line Items */}
      <JobLineItemsSection
        jobId={initialJob.id}
        lineItems={initialJob.lineItems}
        taxRate={initialJob.taxRate}
      />

      {/* Expenses */}
      <JobExpensesSection
        jobId={initialJob.id}
        expenses={initialJob.expenses}
      />

      {/* Visits */}
      <JobVisitsSection
        visits={initialJob.visits}
        jobInfo={{
          id: initialJob.id,
          number: initialJob.number || 0,
          title: initialJob.title,
          client: initialJob.client,
          property: initialJob.property
        }}
        teamMembers={teamMembers}
      />

      {/* Invoices */}
      <JobInvoicesSection invoices={initialJob.invoices} />
    </div>
  );
}

