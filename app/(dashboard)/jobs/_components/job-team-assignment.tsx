/**
 * JOB TEAM ASSIGNMENT COMPONENT
 * 
 * Purpose:
 * Display and manage team assignments for a job.
 * For recurring jobs, team assignments apply to all visits.
 * 
 * Features:
 * - Shows currently assigned team members
 * - Allows adding/removing team members
 * - Updates both job and all visits
 */

'use client';

import { useState } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface JobTeamAssignmentProps {
  jobId: string;
  assignees: string[]; // Array of user IDs
  teamMembers: TeamMember[];
  isRecurring: boolean;
}

export function JobTeamAssignment({ jobId, assignees, teamMembers, isRecurring }: JobTeamAssignmentProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(assignees);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedMembers = teamMembers.filter(m => assignees.includes(m.user.id));
  const availableMembers = teamMembers.filter(m => !selectedAssignees.includes(m.user.id));

  const handleToggle = (userId: string) => {
    if (selectedAssignees.includes(userId)) {
      setSelectedAssignees(selectedAssignees.filter(id => id !== userId));
    } else {
      setSelectedAssignees([...selectedAssignees, userId]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/assignees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignees: selectedAssignees }),
      });

      if (!response.ok) throw new Error('Failed to update team');

      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-brand-bg rounded-xl shadow-sm border border-brand-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand" />
            Assigned Team
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors text-sm flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Manage Team
          </button>
        </div>

        {assignedMembers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center px-3 py-2 bg-brand/10 text-brand rounded-lg border border-brand"
              >
                <Users className="w-3 h-3 mr-1.5" />
                <span className="font-medium text-sm">{member.user.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No team members assigned yet
          </p>
        )}

        {isRecurring && assignedMembers.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
            These team members are assigned to all visits for this recurring job
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm border border-brand-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-brand" />
          Assign Team
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        {teamMembers.map((member) => {
          const isAssigned = selectedAssignees.includes(member.user.id);
          return (
            <label
              key={member.id}
              className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isAssigned
                  ? 'border-brand bg-brand/5 dark:bg-brand/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isAssigned}
                onChange={() => handleToggle(member.user.id)}
                className="w-4 h-4 text-brand focus:ring-brand border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
              </div>
            </label>
          );
        })}
      </div>

      {isRecurring && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> These team members will be assigned to all visits for this recurring job
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors flex items-center"
        >
          {isSubmitting ? 'Saving...' : 'Save Team'}
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedAssignees(assignees);
          }}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

