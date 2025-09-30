'use client';

import { useState } from 'react';
import { Plus, Shield, User, Users as UsersIcon, Mail, Key, Trash2, CheckCircle, X } from 'lucide-react';
import { updateUserRole, removeUserFromOrg, sendPasswordReset, addUserToOrg } from '@/server/actions/admin';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Membership {
  id: string;
  role: string;
  user: User;
}

interface UserManagementTableProps {
  memberships: Membership[];
  orgId: string;
}

export function UserManagementTable({ memberships, orgId }: UserManagementTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    role: 'STAFF' as 'OWNER' | 'ADMIN' | 'STAFF',
  });
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleRoleChange = async (membershipId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') => {
    setLoading(membershipId);
    try {
      await updateUserRole(membershipId, newRole);
      setSuccessMessage('Role updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (error) {
      alert('Failed to update role');
    } finally {
      setLoading(null);
    }
  };

  const handlePasswordReset = async (email: string, userName: string) => {
    if (!confirm(`Send password reset email to ${userName} (${email})?`)) return;
    
    setLoading(email);
    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        setSuccessMessage(`Password reset email sent to ${email}`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        alert(result.message || 'Failed to send password reset');
      }
    } catch (error) {
      alert('Failed to send password reset');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveUser = async (membershipId: string, userName: string, userEmail: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE user ${userName} (${userEmail})?\n\nThis will:\n- Remove their access to this organization\n- Delete their user account permanently\n- Cannot be undone\n\nAre you sure?`)) return;
    
    setLoading(membershipId);
    try {
      await removeUserFromOrg(membershipId);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();
    } catch (error) {
      alert('Failed to remove user');
    } finally {
      setLoading(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);
    setTempPassword(null);
    setAddUserLoading(true);

    try {
      const result = await addUserToOrg({
        orgId,
        name: addUserForm.name,
        email: addUserForm.email,
        role: addUserForm.role,
      });

      if (result.success) {
        setTempPassword(result.temporaryPassword);
        setSuccessMessage(`User ${addUserForm.name} added successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Reset form
        setAddUserForm({ name: '', email: '', role: 'STAFF' });
        
        // Close modal after showing success (with temp password)
        setTimeout(() => {
          setShowAddModal(false);
          setTempPassword(null);
        }, 8000);
        
        router.refresh();
      }
    } catch (error) {
      setAddUserError(error instanceof Error ? error.message : 'Failed to add user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700">
            <Shield className="w-3 h-3 mr-1" />
            Owner
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-700">
            <UsersIcon className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-300 border border-green-700">
            <User className="w-3 h-3 mr-1" />
            Staff
          </span>
        );
      default:
        return <span className="text-gray-400">{role}</span>;
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-gradient-to-br from-purple-500 to-purple-700';
      case 'ADMIN':
        return 'bg-gradient-to-br from-blue-500 to-blue-700';
      case 'STAFF':
        return 'bg-gradient-to-br from-green-500 to-green-700';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-700';
    }
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-blue-400" />
              Team Members ({memberships.length})
            </h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
          <p className="text-sm text-gray-400">Manage user access, roles, and passwords</p>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 bg-green-900/30 border border-green-600 rounded-lg p-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-300">{successMessage}</p>
          </div>
        )}
      </div>
      
      {/* Users List */}
      <div className="divide-y divide-gray-700">
        {memberships.map((membership) => (
          <div 
            key={membership.id} 
            className="p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between gap-6">
              {/* User Info */}
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 ${getAvatarColor(membership.role)}`}>
                  {membership.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white text-base truncate">
                      {membership.user.name}
                    </h3>
                    {getRoleBadge(membership.role)}
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Mail className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{membership.user.email}</span>
                  </div>
                  
                  {/* Role Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-medium">Change Role:</span>
                    <select
                      value={membership.role}
                      onChange={(e) => handleRoleChange(membership.id, e.target.value as any)}
                      disabled={loading === membership.id}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-colors"
                    >
                      <option value="OWNER">👑 Owner</option>
                      <option value="ADMIN">🔷 Admin</option>
                      <option value="STAFF">👤 Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                <button 
                  onClick={() => handlePasswordReset(membership.user.email, membership.user.name)}
                  disabled={loading === membership.user.email}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
                  title="Send password reset email"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </button>
                <button 
                  onClick={() => handleRemoveUser(membership.id, membership.user.name, membership.user.email)}
                  disabled={loading === membership.id}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
                  title="Permanently delete user and remove access"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        ))}

        {memberships.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No team members yet</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First User
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Add User Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-2 text-green-400" />
                Add New User
              </h3>
              <p className="text-sm text-gray-400 mt-1">Create a new team member account</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(false);
                setAddUserError(null);
                setTempPassword(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleAddUser} className="p-6 space-y-4">
            {/* Error Message */}
            {addUserError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 text-sm text-red-300">
                {addUserError}
              </div>
            )}

            {/* Success Message with Temp Password */}
            {tempPassword && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-sm font-semibold text-green-300">User created successfully!</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded p-3 mt-3">
                  <p className="text-xs text-gray-400 mb-1">Temporary Password:</p>
                  <p className="text-lg font-mono font-bold text-white">{tempPassword}</p>
                  <p className="text-xs text-gray-400 mt-2">⚠️ Save this password - it won't be shown again!</p>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={addUserForm.name}
                onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                required
                disabled={addUserLoading || !!tempPassword}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                required
                disabled={addUserLoading || !!tempPassword}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                placeholder="john@example.com"
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <select
                value={addUserForm.role}
                onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as any })}
                disabled={addUserLoading || !!tempPassword}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              >
                <option value="STAFF">👤 Staff - Basic access</option>
                <option value="ADMIN">🔷 Admin - Full management access</option>
                <option value="OWNER">👑 Owner - Complete control</option>
              </select>
            </div>

            {/* Info Note */}
            {!tempPassword && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  ℹ️ A temporary password will be generated and sent via email. The user can change it after their first login.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              {!tempPassword ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddUserError(null);
                    }}
                    disabled={addUserLoading}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addUserLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {addUserLoading ? 'Creating...' : 'Create User'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setTempPassword(null);
                    setAddUserError(null);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Done
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )}
  </>
  );
}
