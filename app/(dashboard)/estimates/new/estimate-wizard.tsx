'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEstimate } from '@/server/actions/estimates';
import {
  FileText,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  ArrowLeft,
  Check,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '@/ui/components/custom-select';

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface Lead {
  id: string;
  name: string;
  emails: string[];
}

interface EstimateWizardProps {
  clients: Client[];
  leads: Lead[];
  orgId: string;
}

export function EstimateWizard({ clients, leads, orgId }: EstimateWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    forType: 'client' as 'client' | 'lead',
    clientId: '',
    leadId: '',
    propertyId: '',
    amount: '',
    validUntil: '',
    status: 'DRAFT',
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createEstimate({
        title: formData.title,
        description: formData.description || undefined,
        clientId: formData.forType === 'client' ? formData.clientId : undefined,
        leadId: formData.forType === 'lead' ? formData.leadId : undefined,
        propertyId: formData.propertyId || undefined,
        amount: parseFloat(formData.amount),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
        status: formData.status,
      });
      
      router.push('/estimates');
    } catch (err: any) {
      setError(err.message || 'Failed to create estimate');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="w-7 h-7 mr-2 text-brand" />
            Create New Estimate
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Prepare a quote for a client or lead</p>
        </div>
        <Link
          href="/estimates"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Estimates
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand" />
            Recipient
          </h2>
          
          <div className="space-y-4">
            {/* Toggle between Client/Lead */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, forType: 'client', leadId: '' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  formData.forType === 'client'
                    ? 'bg-brand-bg-tertiary border-brand'
                    : 'bg-brand-bg border border-brand-border rounded-lg p-4 shadow-sm hover:border-brand-border-hover'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-2 text-brand" />
                <p className="font-medium text-gray-900 dark:text-white">Existing Client</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For current clients</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, forType: 'lead', clientId: '', propertyId: '' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  formData.forType === 'lead'
                    ? 'bg-[#f7faf7] dark:bg-gray-700 border-[#4a7c59]'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <UserPlus className="w-5 h-5 mx-auto mb-2 text-[#4a7c59]" />
                <p className="font-medium text-gray-900 dark:text-white">Lead</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For potential clients</p>
              </button>
            </div>

            {formData.forType === 'client' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.clientId}
                    onChange={(value) => setFormData({ ...formData, clientId: value, propertyId: '' })}
                    disabled={isSubmitting}
                    options={[
                      { value: '', label: 'Select a client...' },
                      ...clients.map(client => ({ value: client.id, label: client.name }))
                    ]}
                    placeholder="Select a client..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property</label>
                  <CustomSelect
                    value={formData.propertyId}
                    onChange={(value) => setFormData({ ...formData, propertyId: value })}
                    disabled={isSubmitting || !selectedClient}
                    options={[
                      { value: '', label: 'Select a property...' },
                      ...(selectedClient?.properties.map(property => ({ value: property.id, label: property.address })) || [])
                    ]}
                    placeholder="Select a property..."
                  />
                  {!selectedClient && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select a client first</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lead <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={formData.leadId}
                  onChange={(value) => setFormData({ ...formData, leadId: value })}
                  disabled={isSubmitting}
                  options={[
                    { value: '', label: 'Select a lead...' },
                    ...leads.map(lead => ({ value: lead.id, label: `${lead.name} (${lead.emails[0] || 'No email'})` }))
                  ]}
                  placeholder="Select a lead..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Estimate Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#4a7c59]" />
            Estimate Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimate Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="e.g., Deep Cleaning Service"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Detailed description of services to be provided..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <CustomSelect
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isSubmitting}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'SENT', label: 'Sent' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
                placeholder="Select status..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/estimates"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all disabled:opacity-50 font-semibold shadow-lg"
          >
            {isSubmitting ? 'Creating Estimate...' : 'Create Estimate'}
          </button>
        </div>
      </form>
    </div>
  );
}
