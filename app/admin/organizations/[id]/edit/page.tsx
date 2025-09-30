'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building, Save } from 'lucide-react';
import { getOrganizationForEdit, updateOrganization } from '@/server/actions/admin';

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const org = await getOrganizationForEdit(params.id as string);
        setFormData({
          name: org.name,
          slug: org.slug,
          industry: org.industry || 'cleaning',
        });
      } catch (err) {
        setError('Failed to load organization');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await updateOrganization(params.id as string, formData);
      router.push(`/admin/organizations/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/admin/organizations/${params.id}`}
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organization
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Organization</h1>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-600 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Slug (URL identifier)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-gray-500 mt-1">Can only contain lowercase letters, numbers, and hyphens</p>
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

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <Link
                href={`/admin/organizations/${params.id}`}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
