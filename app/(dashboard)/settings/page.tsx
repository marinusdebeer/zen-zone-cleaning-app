import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon, User, Bell, Lock, CreditCard, Building, Palette } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#f7faf7] rounded-lg">
              <User className="h-5 w-5 text-[#4a7c59]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={session?.user?.name || ''}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
              Update Account
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#f7faf7] rounded-lg">
              <Lock className="h-5 w-5 text-[#4a7c59]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              />
            </div>
            <button className="w-full px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
              Change Password
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#f7faf7] rounded-lg">
              <Bell className="h-5 w-5 text-[#4a7c59]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded text-[#4a7c59]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Job Reminders</span>
              <input type="checkbox" defaultChecked className="rounded text-[#4a7c59]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Payment Alerts</span>
              <input type="checkbox" defaultChecked className="rounded text-[#4a7c59]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Client Messages</span>
              <input type="checkbox" defaultChecked className="rounded text-[#4a7c59]" />
            </label>
            <button className="w-full px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-[#f7faf7] rounded-lg">
            <Building className="h-5 w-5 text-[#4a7c59]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              defaultValue="Zen Zone Cleaning Services"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              defaultValue="(705) 242-1166"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              defaultValue="admin@zenzonecleaning.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Industry</label>
            <input
              type="text"
              defaultValue="Cleaning Services"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              defaultValue="49 High St Suite 300, Barrie, ON L4N 5J4, Canada"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
            Update Business Info
          </button>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-[#f7faf7] rounded-lg">
            <Palette className="h-5 w-5 text-[#4a7c59]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Branding & Appearance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Primary Color</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                defaultValue="#2e3d2f"
                className="h-10 w-full rounded-lg border border-gray-300"
              />
              <span className="text-xs text-gray-500">#2e3d2f</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Secondary Color</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                defaultValue="#4a7c59"
                className="h-10 w-full rounded-lg border border-gray-300"
              />
              <span className="text-xs text-gray-500">#4a7c59</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Action Color</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                defaultValue="#4a8c37"
                className="h-10 w-full rounded-lg border border-gray-300"
              />
              <span className="text-xs text-gray-500">#4a8c37</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Accent Color</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                defaultValue="#78A265"
                className="h-10 w-full rounded-lg border border-gray-300"
              />
              <span className="text-xs text-gray-500">#78A265</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="px-6 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
            Update Branding
          </button>
        </div>
      </div>
    </div>
  );
}
