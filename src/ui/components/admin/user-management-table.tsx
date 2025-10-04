/**
 * ⚠️ MODULAR DESIGN REMINDER
 * This file is 428+ lines and should be refactored into smaller components.
 * See docs/MODULAR_DESIGN.md for guidelines.
 * Target: <300 lines per component
 * 
 * Suggested extractions:
 * - User row component
 * - Add user modal component
 * - Role selector component
 * - Form state logic into custom hook
 */

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
          <span className="admin-badge-owner inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3 mr-1" />
            Owner
          </span>
        );
      case 'ADMIN':
        return (
          <span className="admin-badge-admin inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold">
            <UsersIcon className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="admin-badge-staff inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold">
            <User className="w-3 h-3 mr-1" />
            Staff
          </span>
        );
      default:
        return <span className="admin-text-tertiary">{role}</span>;
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'admin-brand-gradient-accent';
      case 'ADMIN':
        return 'admin-brand-gradient';
      case 'STAFF':
        return 'admin-brand-gradient';
      default:
        return 'admin-bg-tertiary';
    }
  };

  return (
    <>
      <div className="admin-card overflow-hidden">
        {/* Header */}
        <div className="pb-6 border-b admin-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 admin-icon-primary" />
              Team Members ({memberships.length})
            </h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="admin-btn-success inline-flex items-center px-4 py-2 rounded-lg shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
          <p className="text-sm">Manage user access, roles, and passwords</p>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 admin-card-secondary border p-3 flex items-center" style={{ borderColor: 'var(--admin-success)' }}>
            <CheckCircle className="w-5 h-5 admin-icon-success mr-2 flex-shrink-0" />
            <p className="text-sm">{successMessage}</p>
          </div>
        )}
      </div>
      
      {/* Users List */}
      <div className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
        {memberships.map((membership) => (
          <div 
            key={membership.id} 
            className="admin-table-row p-6"
          >
            <div className="flex items-start justify-between gap-6">
              {/* User Info */}
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 ${getAvatarColor(membership.role)}`}>
                  {membership.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-base truncate">
                      {membership.user.name}
                    </h3>
                    {getRoleBadge(membership.role)}
                  </div>
                  <div className="flex items-center text-sm admin-text-secondary mb-3">
                    <Mail className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{membership.user.email}</span>
                  </div>
                  
                  {/* Role Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs admin-text-tertiary font-medium">Change Role:</span>
                    <select
                      value={membership.role}
                      onChange={(e) => handleRoleChange(membership.id, e.target.value as any)}
                      disabled={loading === membership.id}
                      className="admin-input px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
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
                  className="admin-btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 shadow-lg"
                  title="Send password reset email"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </button>
                <button 
                  onClick={() => handleRemoveUser(membership.id, membership.user.name, membership.user.email)}
                  disabled={loading === membership.id}
                  className="admin-btn-danger inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg disabled:opacity-50 shadow-lg"
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
            <UsersIcon className="w-12 h-12 admin-text-tertiary mx-auto mb-4" />
            <p className="mb-4">No team members yet</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="admin-btn-primary inline-flex items-center px-4 py-2 rounded-lg"
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
        <div className="admin-card max-w-md w-full shadow-2xl">
          {/* Modal Header */}
          <div className="pb-6 border-b admin-border flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Plus className="w-6 h-6 mr-2 admin-icon-success" />
                Add New User
              </h3>
              <p className="text-sm mt-1">Create a new team member account</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(false);
                setAddUserError(null);
                setTempPassword(null);
              }}
              className="admin-text-secondary hover:admin-text-primary transition-colors"
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
              <div className="admin-card-secondary border" style={{ borderColor: 'var(--admin-success)' }}>
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 admin-icon-success mr-2" />
                  <p className="text-sm font-semibold">User created successfully!</p>
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
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={addUserForm.name}
                onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                required
                disabled={addUserLoading || !!tempPassword}
                className="admin-input w-full px-4 py-2 rounded-lg disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                required
                disabled={addUserLoading || !!tempPassword}
                className="admin-input w-full px-4 py-2 rounded-lg disabled:opacity-50"
                placeholder="john@example.com"
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={addUserForm.role}
                onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as any })}
                disabled={addUserLoading || !!tempPassword}
                className="admin-input w-full px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <option value="STAFF">👤 Staff - Basic access</option>
                <option value="ADMIN">🔷 Admin - Full management access</option>
                <option value="OWNER">👑 Owner - Complete control</option>
              </select>
            </div>

            {/* Info Note */}
            {!tempPassword && (
              <div className="admin-card-secondary">
                <p className="text-xs">
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
                    className="admin-icon-button flex-1 px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addUserLoading}
                    className="admin-btn-success flex-1 px-4 py-2 rounded-lg disabled:opacity-50"
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
                  className="admin-btn-success w-full px-4 py-2 rounded-lg"
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
