/**
 * ENHANCED REQUEST FORM
 * 
 * Purpose:
 * Comprehensive request creation form matching website form structure
 * Includes: contact, service, property, scheduling, pricing fields
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, X, FileText, User, Home, Package, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { CustomSelect } from '@/ui/components/custom-select';
import { createRequest } from '@/server/actions/requests';

interface Industry {
  id: string;
  slug: string;
  label: string;
  serviceTypes: Array<{
    id: string;
    slug: string;
    label: string;
  }>;
}

interface HearAboutOption {
  id: string;
  slug: string;
  label: string;
}

interface Client {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  properties: { id: string; address: string }[];
}

interface RequestFormEnhancedProps {
  orgId: string;
  clients: Client[];
  industries: Industry[];
  hearAboutOptions: HearAboutOption[];
  existingRequest?: any;
}

export function RequestFormEnhanced({
  orgId,
  clients,
  industries,
  hearAboutOptions,
  existingRequest,
}: RequestFormEnhancedProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Client & Property
    clientId: '',
    propertyId: '',
    
    // Service Details
    industryId: '',
    serviceTypeId: '',
    bookingType: 'One-Time',
    cleaningType: '',
    frequency: '',
    reason: '',
    
    // Property Details (for new clients or additional info)
    propertyType: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    basement: '',
    pets: '',
    petDetails: '',
    parkingInfo: '',
    
    // Scheduling
    datePreferences: '',
    accessMethod: '',
    specialRequests: '',
    
    // Marketing
    hearAboutId: '',
    referralName: '',
    
    // Pricing (optional, from estimate)
    estimatedPrice: '',
    
    // Core fields
    title: '',
    description: '',
    source: 'manual',
    urgency: 'normal',
    notes: '',
  });

  // Populate form when editing existing request
  useEffect(() => {
    if (existingRequest) {
      const details = existingRequest.details || {};
      const serviceDetails = details.serviceDetails || {};
      const propertyDetails = details.propertyDetails || {};
      const scheduling = details.scheduling || {};
      const marketingInfo = details.marketingInfo || {};
      const pricing = details.pricing || {};

      setFormData({
        clientId: existingRequest.clientId || '',
        propertyId: existingRequest.propertyId || '',
        industryId: existingRequest.industryId || '',
        serviceTypeId: existingRequest.serviceTypeId || '',
        bookingType: serviceDetails.bookingType || 'One-Time',
        cleaningType: serviceDetails.cleaningType || '',
        frequency: serviceDetails.frequency || '',
        reason: serviceDetails.reason || '',
        propertyType: propertyDetails.propertyType || '',
        squareFootage: propertyDetails.squareFootage?.toString() || '',
        bedrooms: propertyDetails.bedrooms?.toString() || '',
        bathrooms: propertyDetails.bathrooms?.toString() || '',
        basement: propertyDetails.basement || '',
        pets: propertyDetails.pets || '',
        petDetails: propertyDetails.petDetails || '',
        parkingInfo: propertyDetails.parkingInfo || '',
        datePreferences: scheduling.datePreferences || '',
        accessMethod: scheduling.accessMethod || '',
        specialRequests: scheduling.specialRequests || '',
        hearAboutId: existingRequest.hearAboutId || '',
        referralName: marketingInfo.referralName || '',
        estimatedPrice: pricing.estimatedPrice?.toString() || '',
        title: existingRequest.title || '',
        description: existingRequest.description || '',
        source: existingRequest.source || 'manual',
        urgency: existingRequest.urgency || 'normal',
        notes: existingRequest.notes || '',
      });
    }
  }, [existingRequest]);

  const selectedIndustry = industries.find(i => i.id === formData.industryId);
  const serviceTypes = selectedIndustry?.serviceTypes || [];

  const updateField = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.clientId) {
        throw new Error('Please select a client');
      }

      // Build title from service details if not manually entered
      const title = formData.title || 
        `${selectedIndustry?.label || 'Service'} - ${serviceTypes.find(st => st.id === formData.serviceTypeId)?.label || 'Request'}`;

      // Build description from various fields
      const descriptionParts = [];
      if (formData.reason) descriptionParts.push(`Reason: ${formData.reason}`);
      if (formData.specialRequests) descriptionParts.push(formData.specialRequests);
      if (formData.description) descriptionParts.push(formData.description);
      const description = descriptionParts.join('\n') || undefined;

      // Build details JSON object matching ingested form structure
      const details: any = {
        serviceDetails: {
          industry: selectedIndustry?.label,
          bookingType: formData.bookingType,
          cleaningType: serviceTypes.find(st => st.id === formData.serviceTypeId)?.label,
          frequency: formData.frequency || null,
          reason: formData.reason,
        },
        propertyDetails: formData.propertyType ? {
          propertyType: formData.propertyType,
          squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          basement: formData.basement,
          pets: formData.pets,
          petDetails: formData.petDetails,
          parkingInfo: formData.parkingInfo,
        } : undefined,
        scheduling: (formData.datePreferences || formData.accessMethod || formData.specialRequests) ? {
          datePreferences: formData.datePreferences,
          accessMethod: formData.accessMethod,
          specialRequests: formData.specialRequests,
        } : undefined,
        marketingInfo: formData.referralName ? {
          referralName: formData.referralName,
        } : undefined,
        pricing: formData.estimatedPrice ? {
          estimatedPrice: parseFloat(formData.estimatedPrice),
        } : undefined,
        meta: {
          createdInApp: true,
          createdAt: new Date().toISOString(),
        },
      };

      const requestData = {
        clientId: formData.clientId,
        propertyId: formData.propertyId || undefined,
        title,
        description,
        source: formData.source,
        urgency: formData.urgency,
        notes: formData.notes || undefined,
        industryId: formData.industryId || undefined,
        serviceTypeId: formData.serviceTypeId || undefined,
        hearAboutId: formData.hearAboutId || undefined,
        details: Object.keys(details).length > 1 ? details : undefined,
      };

      await createRequest(orgId, requestData);
      router.push('/requests');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-brand mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {existingRequest ? 'Edit Request' : 'New Customer Request'}
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {existingRequest 
            ? 'Update request details from website form or manual entry' 
            : 'Create a request matching your website form structure'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Client Selection */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-brand" />
            Client & Property
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.clientId}
                onChange={(value) => {
                  updateField({ clientId: value, propertyId: '' });
                }}
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Select a client...' },
                  ...clients.map(client => ({
                    value: client.id,
                    label: client.companyName || `${client.firstName} ${client.lastName}`,
                  })),
                ]}
                placeholder="Choose a client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property (Optional)
              </label>
              <CustomSelect
                value={formData.propertyId}
                onChange={(value) => updateField({ propertyId: value })}
                disabled={isSubmitting || !formData.clientId}
                options={[
                  { value: '', label: 'No specific property' },
                  ...(clients.find(c => c.id === formData.clientId)?.properties || []).map(prop => ({
                    value: prop.id,
                    label: prop.address,
                  })),
                ]}
                placeholder={!formData.clientId ? 'Select client first' : 'Select property'}
              />
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand" />
            Service Details
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <CustomSelect
                  value={formData.industryId}
                  onChange={(value) => updateField({ industryId: value, serviceTypeId: '' })}
                  disabled={isSubmitting}
                  options={[
                    { value: '', label: 'Select industry...' },
                    ...industries.map(ind => ({
                      value: ind.id,
                      label: ind.label,
                    })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type
                </label>
                <CustomSelect
                  value={formData.serviceTypeId}
                  onChange={(value) => updateField({ serviceTypeId: value })}
                  disabled={isSubmitting || !formData.industryId}
                  options={[
                    { value: '', label: 'Select service type...' },
                    ...serviceTypes.map(st => ({
                      value: st.id,
                      label: st.label,
                    })),
                  ]}
                  placeholder={!formData.industryId ? 'Select industry first' : 'Select service type'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking Type
                </label>
                <CustomSelect
                  value={formData.bookingType}
                  onChange={(value) => updateField({ bookingType: value })}
                  disabled={isSubmitting}
                  options={[
                    { value: 'One-Time', label: 'One-Time' },
                    { value: 'Recurring', label: 'Recurring' },
                  ]}
                />
              </div>

              {formData.bookingType === 'Recurring' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <CustomSelect
                    value={formData.frequency}
                    onChange={(value) => updateField({ frequency: value })}
                    disabled={isSubmitting}
                    options={[
                      { value: '', label: 'Select frequency...' },
                      { value: 'Weekly', label: 'Weekly' },
                      { value: 'Bi-Weekly', label: 'Bi-Weekly' },
                      { value: 'Monthly', label: 'Monthly' },
                    ]}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Service
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => updateField({ reason: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="e.g., Preparing for guests/event"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2 text-brand" />
            Property Details (Optional)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Type
              </label>
              <CustomSelect
                value={formData.propertyType}
                onChange={(value) => updateField({ propertyType: value })}
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'House', label: 'House' },
                  { value: 'Condo', label: 'Condo' },
                  { value: 'Apartment', label: 'Apartment' },
                  { value: 'Townhouse', label: 'Townhouse' },
                  { value: 'Office', label: 'Office' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Square Footage
              </label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => updateField({ squareFootage: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="2200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => updateField({ bedrooms: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => updateField({ bathrooms: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Basement
              </label>
              <CustomSelect
                value={formData.basement}
                onChange={(value) => updateField({ basement: value })}
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'No basement', label: 'No Basement' },
                  { value: 'Unfinished', label: 'Unfinished' },
                  { value: 'Finished', label: 'Finished' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pets
              </label>
              <CustomSelect
                value={formData.pets}
                onChange={(value) => updateField({ pets: value })}
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'None', label: 'None' },
                  { value: 'Dog(s)', label: 'Dog(s)' },
                  { value: 'Cat(s)', label: 'Cat(s)' },
                  { value: 'Both', label: 'Both' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pet Details
            </label>
            <input
              type="text"
              value={formData.petDetails}
              onChange={(e) => updateField({ petDetails: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="e.g., 1 golden retriever, moderate shedding"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parking Information
            </label>
            <input
              type="text"
              value={formData.parkingInfo}
              onChange={(e) => updateField({ parkingInfo: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="e.g., Driveway available for 2 vehicles"
            />
          </div>
        </div>

        {/* Scheduling & Access */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-brand" />
            Scheduling & Access
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Preferences
              </label>
              <input
                type="text"
                value={formData.datePreferences}
                onChange={(e) => updateField({ datePreferences: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="e.g., Next Thursday morning, between 9am-12pm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Method
              </label>
              <input
                type="text"
                value={formData.accessMethod}
                onChange={(e) => updateField({ accessMethod: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="e.g., Lockbox or keypad code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Requests
              </label>
              <textarea
                rows={3}
                value={formData.specialRequests}
                onChange={(e) => updateField({ specialRequests: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Any special instructions or requests..."
              />
            </div>
          </div>
        </div>

        {/* Marketing & Source */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-brand" />
            Marketing & Source
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How did they hear about us?
              </label>
              <CustomSelect
                value={formData.hearAboutId}
                onChange={(value) => updateField({ hearAboutId: value })}
                disabled={isSubmitting}
                options={[
                  { value: '', label: 'Select...' },
                  ...hearAboutOptions.map(option => ({
                    value: option.id,
                    label: option.label,
                  })),
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referral Name (if applicable)
              </label>
              <input
                type="text"
                value={formData.referralName}
                onChange={(e) => updateField({ referralName: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Who referred them?"
              />
            </div>
          </div>
        </div>

        {/* Pricing Estimate */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-brand" />
            Pricing Estimate (Optional)
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Price
            </label>
            <input
              type="number"
              value={formData.estimatedPrice}
              onChange={(e) => updateField({ estimatedPrice: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder="345"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Estimated price from website calculator or manual estimate
            </p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand" />
            Additional Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField({ title: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Auto-generated from service details or enter custom title"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave blank to auto-generate from industry and service type
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => updateField({ description: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Additional details about the request..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <CustomSelect
                  value={formData.source}
                  onChange={(value) => updateField({ source: value })}
                  disabled={isSubmitting}
                  options={[
                    { value: 'manual', label: 'Manual Entry' },
                    { value: 'website', label: 'Website' },
                    { value: 'phone', label: 'Phone Call' },
                    { value: 'email', label: 'Email' },
                    { value: 'referral', label: 'Referral' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency
                </label>
                <CustomSelect
                  value={formData.urgency}
                  onChange={(value) => updateField({ urgency: value })}
                  disabled={isSubmitting}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => updateField({ notes: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Internal notes (not visible to client)..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <div className="flex justify-end gap-3">
            <Link
              href="/requests"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors inline-flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !formData.clientId}
              className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {existingRequest ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {existingRequest ? 'Update Request' : 'Create Request'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

