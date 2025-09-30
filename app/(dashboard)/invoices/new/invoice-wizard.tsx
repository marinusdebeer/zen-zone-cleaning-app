'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/server/actions/invoices';
import {
  Receipt,
  Briefcase,
  Calendar,
  DollarSign,
  Percent,
  ArrowLeft,
  Check,
  FileText,
  Users,
  MapPin,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';
import { CustomSelect } from '@/ui/components/custom-select';

interface Job {
  id: string;
  title: string;
  estimatedCost: any;
  client: {
    id: string;
    name: string;
  };
  property: {
    address: string;
  } | null;
  visits: {
    id: string;
    scheduledAt: Date;
    completedAt: Date | null;
    status: string;
  }[];
  invoices: { id: string }[];
}

interface Client {
  id: string;
  name: string;
  emails: any;
}

interface InvoiceWizardProps {
  jobs: Job[];
  clients: Client[];
  orgId: string;
}

export function InvoiceWizard({ jobs, clients, orgId }: InvoiceWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [creationMode, setCreationMode] = useState<'job' | 'scratch'>('job');

  const [formData, setFormData] = useState({
    clientId: '',
    jobId: '',
    visitIds: [] as string[],
    subtotal: '',
    taxRate: '10',
    dueDate: '',
    notes: '',
  });

  const selectedJob = jobs.find(j => j.id === formData.jobId);
  const selectedClient = clients.find(c => c.id === formData.clientId);
  const taxAmount = formData.subtotal ? parseFloat(formData.subtotal) * (parseFloat(formData.taxRate) / 100) : 0;
  const total = formData.subtotal ? parseFloat(formData.subtotal) + taxAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const clientId = creationMode === 'job' && selectedJob 
        ? selectedJob.client.id 
        : formData.clientId;

      if (!clientId) {
        throw new Error('Please select a client or job');
      }

      await createInvoice({
        clientId,
        jobId: creationMode === 'job' ? formData.jobId : undefined,
        visitIds: formData.visitIds,
        subtotal: parseFloat(formData.subtotal),
        taxRate: parseFloat(formData.taxRate),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        notes: formData.notes || undefined,
      });

      router.push('/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Receipt className="w-7 h-7 mr-2 text-[#4a7c59]" />
            Create New Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bill a client for completed services</p>
        </div>
        <Link
          href="/invoices"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <FileText className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Creation Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setCreationMode('job');
              setFormData({ ...formData, clientId: '', jobId: '', visitIds: [] });
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              creationMode === 'job'
                ? 'bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Briefcase className="w-5 h-5 inline mr-2" />
            From Job
          </button>
          <button
            type="button"
            onClick={() => {
              setCreationMode('scratch');
              setFormData({ ...formData, clientId: '', jobId: '', visitIds: [] });
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              creationMode === 'scratch'
                ? 'bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            From Scratch
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job or Client Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          {creationMode === 'job' ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-[#4a7c59]" />
                Select Job
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.jobId}
                    onChange={(value) => setFormData({ ...formData, jobId: value, visitIds: [] })}
                    options={[
                      { value: '', label: 'Select a job...' },
                      ...jobs.map(job => ({
                        value: job.id,
                        label: `${job.client.name} - ${job.title}${job.invoices.length > 0 ? ' (Already invoiced)' : ''}`
                      }))
                    ]}
                    disabled={isSubmitting}
                  />
                </div>

                {selectedJob && (
                  <div className="p-4 bg-[#f7faf7] dark:bg-gray-700 rounded-lg space-y-2">
                    <div className="flex items-start">
                      <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Client</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedJob.client.name}</p>
                      </div>
                    </div>
                    {selectedJob.property && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Property</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedJob.property.address}</p>
                        </div>
                      </div>
                    )}
                    {selectedJob.visits.length > 0 && (
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Completed Visits</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedJob.visits.filter(v => v.status === 'Completed').length} of {selectedJob.visits.length}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedJob && selectedJob.visits.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Include Visits (Optional)
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {selectedJob.visits.map(visit => (
                        <label key={visit.id} className="flex items-center space-x-3 p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.visitIds.includes(visit.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, visitIds: [...formData.visitIds, visit.id] });
                              } else {
                                setFormData({ ...formData, visitIds: formData.visitIds.filter(id => id !== visit.id) });
                              }
                            }}
                            className="w-4 h-4 text-[#4a7c59] rounded focus:ring-2 focus:ring-[#4a7c59]"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(visit.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {visit.status === 'Completed' ? '✅ Completed' : `⏳ ${visit.status}`}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#4a7c59]" />
                Select Client
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={formData.clientId}
                  onChange={(value) => setFormData({ ...formData, clientId: value })}
                  options={[
                    { value: '', label: 'Select a client...' },
                    ...clients.map(client => ({
                      value: client.id,
                      label: client.name
                    }))
                  ]}
                  disabled={isSubmitting}
                />
              </div>

              {selectedClient && (
                <div className="mt-4 p-4 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start">
                    <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Selected Client</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedClient.name}</p>
                      {Array.isArray(selectedClient.emails) && selectedClient.emails[0] && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedClient.emails[0]}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Invoice Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-[#4a7c59]" />
            Invoice Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subtotal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtotal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  required
                  disabled={isSubmitting}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                />
              </div>
              {selectedJob?.estimatedCost && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Suggested: ${Number(selectedJob.estimatedCost).toFixed(2)}
                </p>
              )}
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax Rate (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Percent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Calculation Summary */}
          {formData.subtotal && (
            <div className="mt-6 p-4 bg-[#f7faf7] dark:bg-gray-700 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">${parseFloat(formData.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax ({formData.taxRate}%):</span>
                <span className="font-medium text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-[#4a7c59]">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isSubmitting}
              rows={3}
              placeholder="Add any additional notes, payment terms, or instructions..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4">
          <Link
            href="/invoices"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || (creationMode === 'job' ? !formData.jobId : !formData.clientId) || !formData.subtotal}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg flex items-center justify-center"
          >
            {isSubmitting ? (
              <>Creating Invoice...</>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}