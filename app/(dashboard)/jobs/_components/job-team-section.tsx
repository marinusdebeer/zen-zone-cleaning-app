/**
 * JOB TEAM SECTION COMPONENT
 * 
 * Purpose:
 * Form section for assigning team members to a job.
 * Team members will be assigned to all generated visits.
 * 
 * Features:
 * - Multi-select team member assignment
 * - Shows member names and emails
 * - Visual checkboxes for selection
 * 
 * Props:
 * - teamMembers: Available team members
 * - selectedAssignees: Currently selected user IDs
 * - onAssigneesChange: Callback when selection changes
 * - disabled: Disable during submission
 */

'use client';

import { Users } from 'lucide-react';

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface JobTeamSectionProps {
  teamMembers: TeamMember[];
  selectedAssignees: string[];
  onAssigneesChange: (assignees: string[]) => void;
  disabled?: boolean;
}

export function JobTeamSection({
  teamMembers,
  selectedAssignees,
  onAssigneesChange,
  disabled
}: JobTeamSectionProps) {
  if (teamMembers.length === 0) return null;

  const toggleAssignee = (userId: string) => {
    const newAssignees = selectedAssignees.includes(userId)
      ? selectedAssignees.filter(id => id !== userId)
      : [...selectedAssignees, userId];
    onAssigneesChange(newAssignees);
  };

  return (
    <div className="bg-brand-bg rounded-xl shadow-sm p-6 border border-brand-border">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2 text-brand" />
        Assign Team
      </h2>
      <div className="space-y-2">
        {teamMembers.map(member => (
          <label
            key={member.id}
            className="flex items-center p-3 rounded-lg border border-brand-border hover:bg-[var(--tenant-bg-tertiary)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedAssignees.includes(member.user.id)}
              onChange={() => toggleAssignee(member.user.id)}
              disabled={disabled}
              className="mr-3"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{member.user.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

