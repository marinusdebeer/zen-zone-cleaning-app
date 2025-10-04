/**
 * ⚠️ MODULAR DESIGN REMINDER
 * This file is 448+ lines and should be refactored into smaller components.
 * See docs/MODULAR_DESIGN.md for guidelines.
 * Target: <300 lines per component
 * 
 * Suggested extractions:
 * - Team member card/row component
 * - Invite member modal component
 * - Role management component
 * - Form state logic into custom hook (use-team-form.ts)
 */

'use client';

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Plus,
  X,
  CheckCircle,
  XCircle,
  User,
  Key
} from 'lucide-react';
import { inviteTeamMember, updateMemberRole, removeMember } from '@/server/actions/team';
import { useRouter } from 'next/navigation';
import { CustomSelect } from '@/ui/components/custom-select';

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

interface TeamClientProps {
  memberships: TeamMember[];
  orgName: string;
  currentUserEmail: string;
}

export function TeamClient({ memberships, orgName, currentUserEmail }: TeamClientProps) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'STAFF' as 'OWNER' | 'ADMIN' | 'STAFF',
  });

  const currentUser = memberships.find(m => m.user.email === currentUserEmail);
  const canManageTeam = currentUser && ['OWNER', 'ADMIN'].includes(currentUser.role);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTempPassword(null);

    try {
      const result = await inviteTeamMember(inviteForm);
      if (result.success) {
        setTempPassword(result.temporaryPassword);
        showSuccess(`${inviteForm.name} invited successfully!`);
        setTimeout(() => {
          setShowInviteModal(false);
          setTempPassword(null);
          setInviteForm({ name: '', email: '', role: 'STAFF' });
        }, 8000);
        router.refresh();
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to invite team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') => {
    try {
      await updateMemberRole(membershipId, newRole);
      showSuccess('Role updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemove = async (membershipId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from the team? This will delete their account and cannot be undone.`)) return;

    try {
      await removeMember(membershipId);
      showSuccess('Team member removed successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to remove team member');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-brand-bg-tertiary text-brand-text border-purple-200 dark:border-purple-800';
      case 'ADMIN':
        return 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300 border-brand';
      case 'STAFF':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="w-3 h-3" />;
      case 'ADMIN':
        return <Users className="w-3 h-3" />;
      case 'STAFF':
        return <User className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const stats = {
    total: memberships.length,
    owners: memberships.filter(m => m.role === 'OWNER').length,
    admins: memberships.filter(m => m.role === 'ADMIN').length,
    staff: memberships.filter(m => m.role === 'STAFF').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-7 h-7 mr-2 text-brand" />
            Team Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team and their roles</p>
        </div>
        {canManageTeam && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Invite Member
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
          <span className="text-red-800 dark:text-red-200">{errorMessage}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <Users className="h-6 w-6 text-brand" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Owners</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.owners}</p>
            </div>
            <Shield className="h-6 w-6 text-brand" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-brand-info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.admins}</p>
            </div>
            <Users className="h-6 w-6 text-brand" />
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.staff}</p>
            </div>
            <User className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-brand-bg rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Team Members</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((member) => (
              <div 
                key={member.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all hover:border-brand bg-brand-bg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center ${getRoleBadge(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1">{member.role}</span>
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{member.user.name}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{member.user.email}</span>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Joined</span>
                    <span>{new Date(member.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Actions */}
                {canManageTeam && member.user.email !== currentUserEmail && (
                  <div className="space-y-2">
                    <CustomSelect
                      value={member.role}
                      onChange={(value) => handleRoleChange(member.id, value as any)}
                      options={[
                        { value: 'OWNER', label: '👑 Owner' },
                        { value: 'ADMIN', label: '🔷 Admin' },
                        { value: 'STAFF', label: '👤 Staff' },
                      ]}
                      placeholder="Select role..."
                    />
                    <button
                      onClick={() => handleRemove(member.id, member.user.name)}
                      className="w-full px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                )}

                {member.user.email === currentUserEmail && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      This is you
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {memberships.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No team members yet</p>
              {canManageTeam && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand transition-colors"
                >
                  Invite First Member
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-bg rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-brand" />
                  Invite Team Member
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add a new member to {orgName}</p>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setTempPassword(null);
                }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {/* Success with Password */}
              {tempPassword && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Team member invited!</p>
                  </div>
                  <div className="bg-brand-bg border border-green-300 dark:border-green-700 rounded p-3 mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Temporary Password:</p>
                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{tempPassword}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">⚠️ Save this - it won't be shown again!</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                  disabled={loading || !!tempPassword}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                  disabled={loading || !!tempPassword}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-brand disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-400"
                  placeholder="john@example.com"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <CustomSelect
                  value={inviteForm.role}
                  onChange={(value) => setInviteForm({ ...inviteForm, role: value as any })}
                  disabled={loading || !!tempPassword}
                  options={[
                    { value: 'STAFF', label: '👤 Staff - Basic access' },
                    { value: 'ADMIN', label: '🔷 Admin - Full management' },
                    { value: 'OWNER', label: '👑 Owner - Complete control' },
                  ]}
                  placeholder="Select role..."
                />
              </div>

              {/* Info */}
              {!tempPassword && (
                <div className="bg-brand-bg-tertiary border border-brand rounded-lg p-3">
                  <p className="text-xs text-brand-text">
                    ℹ️ A temporary password will be generated and sent via email
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                {!tempPassword ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand transition-colors disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Inviting...' : 'Send Invitation'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setTempPassword(null);
                      setInviteForm({ name: '', email: '', role: 'STAFF' });
                    }}
                    className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand transition-colors font-medium"
                  >
                    Done
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
