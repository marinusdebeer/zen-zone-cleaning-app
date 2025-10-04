'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getClientDisplayName } from '@/lib/client-utils';

interface PropertyEditFormProps {
  property: any;
  orgId: string;
}

export function PropertyEditForm({ property, orgId }: PropertyEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const custom = property.custom || {};
  
  const [formData, setFormData] = useState({
    address: property.address || '',
    notes: property.notes || '',
    propertyType: custom.propertyType || '',
    squareFootage: custom.squareFootage?.toString() || '',
    bedrooms: custom.bedrooms?.toString() || '',
    bathrooms: custom.bathrooms?.toString() || '',
    basement: custom.basement || '',
    pets: custom.pets || '',
    petDetails: custom.petDetails || '',
    parkingInfo: custom.parkingInfo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          notes: formData.notes,
          custom: {
            propertyType: formData.propertyType || null,
            squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
            basement: formData.basement || null,
            pets: formData.pets || null,
            petDetails: formData.petDetails || null,
            parkingInfo: formData.parkingInfo || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      router.push(`/properties/${property.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Home className="w-6 h-6 mr-2 text-brand" />
              Edit Property
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getClientDisplayName(property.client)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Address */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="123 Main St, City, Province, Postal Code"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
              <input
                type="text"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="House, Condo, Apartment, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Square Footage</label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Basement</label>
              <input
                type="text"
                value={formData.basement}
                onChange={(e) => setFormData({ ...formData, basement: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Finished, Unfinished, None"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pets</label>
              <input
                type="text"
                value={formData.pets}
                onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Dog(s), Cat(s), None, etc."
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pet Details</label>
            <input
              type="text"
              value={formData.petDetails}
              onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., 2 dogs, minimal shedding"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parking Information</label>
            <input
              type="text"
              value={formData.parkingInfo}
              onChange={(e) => setFormData({ ...formData, parkingInfo: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Driveway available, Street parking, etc."
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Additional notes about this property..."
          />
        </div>

        {/* Actions */}
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <div className="flex justify-end gap-3">
            <Link
              href={`/properties/${property.id}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Property
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

