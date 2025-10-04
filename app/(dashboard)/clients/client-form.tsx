/**
 * CLIENT FORM (Unified Create/Edit)
 * 
 * Purpose:
 * Handles both creating new clients and editing existing ones
 * Uses same component for both modes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, updateClient } from '@/server/actions/clients';
import Link from 'next/link';
import { X, User } from 'lucide-react';

interface ExistingClient {
  id: string;
  name: string;
  emails: any;
  phones: any;
  addresses: any;
  clientStatus?: string;
  leadStatus?: string;
  leadSource?: string | null;
  notes?: string | null;
}

interface ClientFormProps {
  orgId: string;
  existingClient?: ExistingClient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ orgId, existingClient, onSuccess, onCancel }: ClientFormProps) {
  const router = useRouter();
  const isEditMode = !!existingClient;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form values
  const [formValues, setFormValues] = useState({
    name: existingClient?.name || '',
    emails: Array.isArray(existingClient?.emails) 
      ? (existingClient.emails as string[]).join(', ')
      : '',
    phones: Array.isArray(existingClient?.phones)
      ? (existingClient.phones as string[]).join(', ')
      : '',
    addresses: Array.isArray(existingClient?.addresses)
      ? (existingClient.addresses as string[]).join(', ')
      : '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        ...(isEditMode && existingClient && { id: existingClient.id }),
        name: formValues.name,
        emails: formValues.emails
          ? formValues.emails.split(',').map(e => e.trim()).filter(Boolean)
          : [],
        phones: formValues.phones
          ? formValues.phones.split(',').map(p => p.trim()).filter(Boolean)
          : [],
        addresses: formValues.addresses
          ? formValues.addresses.split(',').map(a => a.trim()).filter(Boolean)
          : [],
      };

      if (isEditMode && existingClient) {
        await updateClient(orgId, data);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/clients/${existingClient.id}`);
        }
      } else {
        await createClient(orgId, data);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/clients');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} client`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-6 h-6 text-brand mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Client' : 'Create New Client'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-brand-bg rounded-xl shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="Client name"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="emails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Addresses
              </label>
              <input
                type="text"
                name="emails"
                id="emails"
                value={formValues.emails}
                onChange={(e) => setFormValues({ ...formValues, emails: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="email1@example.com, email2@example.com"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple emails with commas</p>
            </div>

            <div>
              <label htmlFor="phones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Numbers
              </label>
              <input
                type="text"
                name="phones"
                id="phones"
                value={formValues.phones}
                onChange={(e) => setFormValues({ ...formValues, phones: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="(555) 123-4567, (555) 987-6543"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple phone numbers with commas</p>
            </div>

            <div>
              <label htmlFor="addresses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Addresses
              </label>
              <textarea
                name="addresses"
                id="addresses"
                rows={3}
                value={formValues.addresses}
                onChange={(e) => setFormValues({ ...formValues, addresses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="123 Main St, City, State 12345"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple addresses with commas</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          ) : (
            <Link
              href={isEditMode && existingClient ? `/clients/${existingClient.id}` : '/clients'}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Link>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formValues.name}
            className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Client' : 'Create Client')}
          </button>
        </div>
      </form>
    </div>
  );
}

