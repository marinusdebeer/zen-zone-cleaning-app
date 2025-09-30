'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Mail, User, CheckCircle } from 'lucide-react';
import { createOrganization } from '@/server/actions/admin';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: 'cleaning',
    ownerName: '',
    ownerEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ tempPassword?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await createOrganization(formData);
      setSuccess({ tempPassword: result.tempPassword });
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Organization</h1>
          <p className="text-gray-400 mt-1">Add a new cleaning business to the platform</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Organization Created Successfully!</h3>
                <p className="text-sm text-gray-300 mt-1">Redirecting to admin dashboard...</p>
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-white mb-2"><strong>Owner Login Credentials:</strong></p>
              <p className="text-sm text-gray-300">Email: {formData.ownerEmail}</p>
              <p className="text-sm text-gray-300">Temporary Password: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{success.tempPassword}</span></p>
              <p className="text-xs text-yellow-300 mt-2">⚠️ Save these credentials - they won't be shown again!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-400" />
                Organization Information
              </h3>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sparkle Clean Services"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Slug * <span className="text-xs text-gray-500">(used in URLs, auto-generated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="sparkle-clean"
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preview: yourdomain.com/org/{formData.slug || 'slug'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cleaning">Cleaning Services</option>
                  <option value="residential">Residential Cleaning</option>
                  <option value="commercial">Commercial Cleaning</option>
                  <option value="specialized">Specialized Cleaning</option>
                </select>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-green-400" />
                Organization Owner
              </h3>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Owner Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="owner@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Owner will receive login credentials via email
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>What happens next:</strong>
                <br />
                1. Organization is created with isolated database
                <br />
                2. Owner account is created with temporary password
                <br />
                3. Owner receives welcome email with login details
                <br />
                4. Organization is immediately ready to use
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <Link
                href="/admin"
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
