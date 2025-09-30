'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJob } from '@/server/actions/jobs';
import {
  Briefcase,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  Repeat,
  Plus,
  X,
  ArrowLeft,
  Check
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

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Service {
  name: string;
  defaultPrice?: number;
}

interface JobWizardProps {
  clients: Client[];
  teamMembers: TeamMember[];
  services: Service[];
  orgId: string;
  initialStartTime?: Date;
  initialEndTime?: Date;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function JobWizard({ clients, teamMembers, services, orgId, initialStartTime, initialEndTime, onCancel, onSuccess }: JobWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Format initial date and time from calendar selection
  const getInitialDate = () => {
    if (initialStartTime) {
      return initialStartTime.toISOString().split('T')[0];
    }
    return '';
  };

  const getInitialTime = () => {
    if (initialStartTime) {
      const hours = initialStartTime.getHours().toString().padStart(2, '0');
      const minutes = initialStartTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '';
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    propertyId: '',
    scheduledDate: getInitialDate(),
    scheduledTime: getInitialTime(),
    estimatedCost: '',
    priority: 'normal',
    status: 'Scheduled',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringDays: [] as number[],
    recurringEndDate: '',
    assignees: [] as string[],
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const scheduledAt = formData.scheduledDate && formData.scheduledTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        : undefined;

      await createJob(orgId, {
        title: formData.title,
        description: formData.description || undefined,
        clientId: formData.clientId,
        propertyId: formData.propertyId || undefined,
        scheduledAt,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        priority: formData.priority,
        status: formData.status,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
        recurringDays: formData.isRecurring && formData.recurringDays.length > 0 ? formData.recurringDays : undefined,
        recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        assignees: formData.assignees,
        custom: {}
      });
      
      // Use onSuccess callback if provided (from calendar), otherwise navigate to jobs list
      if (onSuccess) {
        onSuccess();
      } else {
      router.push('/jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={onCancel ? "space-y-6" : "max-w-5xl mx-auto space-y-6"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Briefcase className="w-7 h-7 mr-2 text-brand" />
            Create New Job
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details to schedule a job</p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        ) : (
          <Link
            href="/jobs"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-brand" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">
                Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="e.g., Weekly Office Cleaning"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Add any additional details or special instructions..."
        />
      </div>

      <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Property</label>
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
        </div>

        {/* Scheduling */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-brand" />
            Scheduling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

      <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Time</label>
        <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Status</label>
              <CustomSelect
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isSubmitting}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Scheduled', label: 'Scheduled' },
                  { value: 'Active', label: 'Active' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Priority</label>
              <CustomSelect
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value })}
                disabled={isSubmitting}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Estimated Cost</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Options */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Repeat className="w-5 h-5 mr-2 text-brand" />
              Recurring Job
            </h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded text-brand focus:ring-brand mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Recurring</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-4 pl-7 border-l-2 border-[#4a7c59]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Pattern</label>
                  <CustomSelect
                    value={formData.recurringPattern}
                    onChange={(value) => setFormData({ ...formData, recurringPattern: value })}
                    disabled={isSubmitting}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'biweekly', label: 'Bi-weekly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {(formData.recurringPattern === 'weekly' || formData.recurringPattern === 'biweekly') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          formData.recurringDays.includes(index)
                            ? 'bg-brand text-white'
                            : 'bg-brand-bg-secondary hover:bg-brand-bg-tertiary'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Assignment */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand" />
            Team Assignment
          </h2>
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleAssignee(member.user.id)}
                  className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                    formData.assignees.includes(member.user.id)
                      ? 'bg-brand-bg-tertiary border-brand'
                      : 'bg-brand-bg border border-brand-border rounded-lg p-4 shadow-sm hover:border-brand-border-hover'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    formData.assignees.includes(member.user.id) ? 'bg-brand' : 'bg-brand-bg-tertiary'
                  }`}>
                    {member.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="ml-3 text-left flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                  </div>
                  {formData.assignees.includes(member.user.id) && (
                    <Check className="w-5 h-5 text-brand ml-2" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No team members available. <Link href="/team" className="text-brand hover:text-brand-dark">Add team members</Link>
            </p>
          )}
        </div>

        {/* Quick Service Templates */}
        {services.length > 0 && (
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Service Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((service: any) => (
        <button
                  key={service.name}
          type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      title: service.name,
                      estimatedCost: service.defaultPrice?.toString() || '',
                    });
                  }}
                  className="p-4 border-2 border-brand-border rounded-lg hover:border-brand hover:bg-brand-bg-tertiary transition-all text-left"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                  {service.defaultPrice && (
                    <p className="text-sm text-brand font-semibold mt-1">
                      ${service.defaultPrice}
                    </p>
                  )}
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/jobs"
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Cancel
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all disabled:opacity-50 font-semibold shadow-lg"
          >
            {isSubmitting ? 'Creating Job...' : 'Create Job'}
          </button>
        </div>
    </form>
    </div>
  );
}