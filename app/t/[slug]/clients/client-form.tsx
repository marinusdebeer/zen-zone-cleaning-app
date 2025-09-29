'use client';

import { useState } from 'react';
import { createClient } from '@/server/actions/clients';

interface ClientFormProps {
  orgSlug: string;
}

export function ClientForm({ orgSlug }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const data = {
        name: formData.get('name') as string,
        emails: formData.get('emails') 
          ? (formData.get('emails') as string).split(',').map(e => e.trim()).filter(Boolean)
          : [],
        phones: formData.get('phones') 
          ? (formData.get('phones') as string).split(',').map(p => p.trim()).filter(Boolean)
          : [],
        addresses: formData.get('addresses') 
          ? (formData.get('addresses') as string).split(',').map(a => a.trim()).filter(Boolean)
          : [],
        custom: {},
      };

      await createClient(orgSlug, data);
      setSuccess(true);
      
      // Reset form
      const form = document.getElementById('client-form') as HTMLFormElement;
      form?.reset();
      
      // Refresh the page to show new client
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="client-form" action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Client name"
        />
      </div>

      <div>
        <label htmlFor="emails" className="block text-sm font-medium text-gray-700">
          Email Addresses
        </label>
        <input
          type="text"
          name="emails"
          id="emails"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="email1@example.com, email2@example.com"
        />
        <p className="mt-1 text-xs text-gray-500">Separate multiple emails with commas</p>
      </div>

      <div>
        <label htmlFor="phones" className="block text-sm font-medium text-gray-700">
          Phone Numbers
        </label>
        <input
          type="text"
          name="phones"
          id="phones"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="(555) 123-4567, (555) 987-6543"
        />
        <p className="mt-1 text-xs text-gray-500">Separate multiple phone numbers with commas</p>
      </div>

      <div>
        <label htmlFor="addresses" className="block text-sm font-medium text-gray-700">
          Addresses
        </label>
        <textarea
          name="addresses"
          id="addresses"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="123 Main St, City, State 12345"
        />
        <p className="mt-1 text-xs text-gray-500">Separate multiple addresses with commas</p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
          Client created successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Client'}
      </button>
    </form>
  );
}

