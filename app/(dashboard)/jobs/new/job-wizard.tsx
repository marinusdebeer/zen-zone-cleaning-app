'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/generated/prisma';
import { createJob } from '@/server/actions/jobs';

interface JobWizardProps {
  orgId: string;
  clients: Client[];
}

export function JobWizard({ orgId, clients }: JobWizardProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    scheduledAt: '',
    custom: {} as Record<string, any>
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createJob(orgId, {
        title: formData.title,
        clientId: formData.clientId,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
        assignees: [],
        custom: formData.custom
      });
      
      router.push('/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Job Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Client */}
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
          Client *
        </label>
        <select
          id="clientId"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scheduled Date/Time */}
      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
          Scheduled Date & Time
        </label>
        <input
          type="datetime-local"
          id="scheduledAt"
          value={formData.scheduledAt}
          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}