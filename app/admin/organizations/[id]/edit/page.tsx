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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen admin-bg-secondary p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/admin/organizations/${params.id}`}
            className="admin-link inline-flex items-center mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organization
          </Link>
          <h1 className="text-3xl font-bold">Edit Organization</h1>
        </div>

        <div className="admin-card">
          {error && (
            <div className="admin-error-message mb-6 rounded-lg p-4">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="admin-input w-full px-4 py-3 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Slug (URL identifier)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="admin-input w-full px-4 py-3 rounded-lg"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs admin-text-tertiary mt-1">Can only contain lowercase letters, numbers, and hyphens</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="admin-input w-full px-4 py-3 rounded-lg"
              >
                <option value="cleaning">Cleaning Services</option>
                <option value="residential">Residential Cleaning</option>
                <option value="commercial">Commercial Cleaning</option>
                <option value="specialized">Specialized Cleaning</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t admin-border">
              <Link
                href={`/admin/organizations/${params.id}`}
                className="admin-icon-button px-6 py-3 rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn-primary px-6 py-3 rounded-lg disabled:opacity-50 flex items-center"
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
