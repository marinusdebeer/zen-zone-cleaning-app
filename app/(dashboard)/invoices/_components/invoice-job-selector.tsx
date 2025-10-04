/**
 * INVOICE JOB SELECTOR
 * 
 * Purpose:
 * Select creation mode - from job or from scratch
 * Shows job details when selected
 */

'use client';

import { Briefcase, FileText } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';
import { getClientDisplayName } from '@/lib/client-utils';

interface Job {
  id: string;
  title: string;
  estimatedCost: any;
  client: { id: string; firstName?: string | null; lastName?: string | null; companyName?: string | null };
  property: { address: string } | null;
  visits: { id: string; scheduledAt: Date | string; completedAt: Date | string | null; status: string }[];
  invoices: { id: string }[];
}

interface Client {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
}

interface InvoiceJobSelectorProps {
  creationMode: 'job' | 'scratch';
  jobs: Job[];
  clients: Client[];
  selectedJobId: string;
  selectedClientId: string;
  onModeChange: (mode: 'job' | 'scratch') => void;
  onJobChange: (jobId: string) => void;
  onClientChange: (clientId: string) => void;
  disabled?: boolean;
}

export function InvoiceJobSelector({
  creationMode,
  jobs,
  clients,
  selectedJobId,
  selectedClientId,
  onModeChange,
  onJobChange,
  onClientChange,
  disabled = false,
}: InvoiceJobSelectorProps) {
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2 text-brand" />
        Invoice Source
      </h2>

      {/* Creation Mode Toggle */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => onModeChange('job')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-colors ${
            creationMode === 'job'
              ? 'bg-brand-bg-tertiary border-brand'
              : 'bg-brand-bg border-brand-border hover:border-brand-border-hover'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Briefcase className="w-5 h-5 mx-auto mb-2 text-brand" />
          <p className="font-medium text-gray-900 dark:text-white">From Job</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bill completed work</p>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('scratch')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-colors ${
            creationMode === 'scratch'
              ? 'bg-brand-bg-tertiary border-brand'
              : 'bg-brand-bg border-brand-border hover:border-brand-border-hover'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FileText className="w-5 h-5 mx-auto mb-2 text-brand" />
          <p className="font-medium text-gray-900 dark:text-white">From Scratch</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manual invoice</p>
        </button>
      </div>

      {/* Job Selection */}
      {creationMode === 'job' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Job <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedJobId}
            onChange={onJobChange}
            disabled={disabled}
            options={[
              { value: '', label: 'Select a job...' },
              ...jobs.map(job => ({
                value: job.id,
                label: `${job.title || getClientDisplayName(job.client)} - ${getClientDisplayName(job.client)}`,
              })),
            ]}
            placeholder="Choose a job to invoice"
          />

          {selectedJob && (
            <div className="mt-4 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getClientDisplayName(selectedJob.client)}
              </p>
              {selectedJob.property && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {selectedJob.property.address}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedJob.visits.length} visit(s) • {selectedJob.visits.filter(v => v.completedAt).length} completed
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Client <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedClientId}
            onChange={onClientChange}
            disabled={disabled}
            options={[
              { value: '', label: 'Select a client...' },
              ...clients.map(client => ({
                value: client.id,
                label: getClientDisplayName(client),
              })),
            ]}
            placeholder="Choose a client"
          />
        </div>
      )}
    </div>
  );
}

