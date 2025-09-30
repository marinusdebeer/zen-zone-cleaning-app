'use client';

import { useState } from 'react';
import { 
  Building, 
  User, 
  Lock, 
  Palette, 
  Clock, 
  Briefcase,
  Save,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import {
  updateOrganizationInfo,
  updateBusinessHours,
  updateServices,
  updateBranding,
  updateUserProfile,
  changePassword,
} from '@/server/actions/settings';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  organization: any;
  user: {
    name: string;
    email: string;
  };
}

type Tab = 'organization' | 'account' | 'security' | 'hours' | 'services' | 'branding';

export function SettingsClient({ organization, user }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('organization');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Organization Info State
  const [orgInfo, setOrgInfo] = useState({
    name: organization?.name || '',
    industry: organization?.industry || '',
    phone: organization?.settings?.contact?.phone || '',
    email: organization?.settings?.contact?.email || '',
    address: organization?.settings?.contact?.address || '',
    website: organization?.settings?.contact?.website || '',
    taxRate: organization?.settings?.financial?.taxRate || 0,
    currency: organization?.settings?.financial?.currency || 'USD',
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: user.name,
    email: user.email,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Business Hours State
  const defaultHours = { open: '09:00', close: '17:00', isOpen: true };
  const [businessHours, setBusinessHours] = useState({
    monday: organization?.settings?.businessHours?.monday || defaultHours,
    tuesday: organization?.settings?.businessHours?.tuesday || defaultHours,
    wednesday: organization?.settings?.businessHours?.wednesday || defaultHours,
    thursday: organization?.settings?.businessHours?.thursday || defaultHours,
    friday: organization?.settings?.businessHours?.friday || defaultHours,
    saturday: organization?.settings?.businessHours?.saturday || { open: '09:00', close: '17:00', isOpen: false },
    sunday: organization?.settings?.businessHours?.sunday || { open: '09:00', close: '17:00', isOpen: false },
  });

  // Services State
  const [services, setServices] = useState<{ name: string; description?: string; defaultPrice?: number }[]>(
    organization?.settings?.services || [
      { name: 'Standard Cleaning', defaultPrice: 100 },
      { name: 'Deep Cleaning', defaultPrice: 200 },
      { name: 'Move In/Out Cleaning', defaultPrice: 300 },
    ]
  );

  // Branding State
  const [branding, setBranding] = useState({
    primaryColor: organization?.settings?.branding?.primaryColor || '#2e3d2f',
    secondaryColor: organization?.settings?.branding?.secondaryColor || '#4a7c59',
    accentColor: organization?.settings?.branding?.accentColor || '#4a8c37',
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleSaveOrganization = async () => {
    setLoading(true);
    try {
      await updateOrganizationInfo(orgInfo);
      showSuccess('Organization information updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile(userProfile);
      showSuccess('Profile updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessHours = async () => {
    setLoading(true);
    try {
      await updateBusinessHours(businessHours);
      showSuccess('Business hours updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update business hours');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServices = async () => {
    setLoading(true);
    try {
      await updateServices(services);
      showSuccess('Services updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update services');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    setLoading(true);
    try {
      await updateBranding(branding);
      showSuccess('Branding updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'organization' as Tab, label: 'Organization', icon: Building },
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Lock },
    { id: 'hours' as Tab, label: 'Business Hours', icon: Clock },
    { id: 'services' as Tab, label: 'Services', icon: Briefcase },
    { id: 'branding' as Tab, label: 'Branding', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization and account preferences</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#4a7c59] text-[#4a7c59]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgInfo.name}
                    onChange={(e) => setOrgInfo({ ...orgInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={orgInfo.industry}
                    onChange={(e) => setOrgInfo({ ...orgInfo, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={orgInfo.phone}
                    onChange={(e) => setOrgInfo({ ...orgInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={orgInfo.email}
                    onChange={(e) => setOrgInfo({ ...orgInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={orgInfo.website}
                    onChange={(e) => setOrgInfo({ ...orgInfo, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orgInfo.taxRate}
                    onChange={(e) => setOrgInfo({ ...orgInfo, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={orgInfo.address}
                    onChange={(e) => setOrgInfo({ ...orgInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveOrganization}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveUserProfile}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
              <div className="space-y-3">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-32">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) =>
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, isOpen: e.target.checked },
                            })
                          }
                          className="rounded text-[#4a7c59] mr-2"
                        />
                        <span className="capitalize font-medium">{day}</span>
                      </label>
                    </div>
                    {hours.isOpen && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, open: e.target.value },
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, close: e.target.value },
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                        />
                      </>
                    )}
                    {!hours.isOpen && <span className="text-gray-500">Closed</span>}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveBusinessHours}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Services Offered</h2>
              <button
                onClick={() => setServices([...services, { name: '', defaultPrice: 0 }])}
                className="px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Service
              </button>
            </div>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-3 border border-gray-200 rounded-lg p-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index].name = e.target.value;
                          setServices(newServices);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Price ($)</label>
                      <input
                        type="number"
                        value={service.defaultPrice || 0}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index].defaultPrice = parseFloat(e.target.value) || 0;
                          setServices(newServices);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={service.description || ''}
                        onChange={(e) => {
                          const newServices = [...services];
                          newServices[index].description = e.target.value;
                          setServices(newServices);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setServices(services.filter((_, i) => i !== index))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveServices}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-12 w-full rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="h-12 w-full rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="h-12 w-full rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveBranding}
              disabled={loading}
              className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
