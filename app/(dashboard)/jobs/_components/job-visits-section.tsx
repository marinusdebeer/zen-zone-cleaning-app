/**
 * JOB VISITS SECTION
 * 
 * Displays and manages job visits with modal editing
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { VisitEditModal } from '@/ui/components/visit-edit-modal';

interface Visit {
  id: string;
  number?: number;
  scheduledAt: Date | string;
  completedAt: Date | string | null;
  status: string;
  notes: string | null;
  assignees: any;
  lineItems?: any[];
  job?: any;
}

interface JobVisitsSectionProps {
  visits: Visit[];
  jobInfo: {
    id: string;
    number: number;
    title: string | null;
    client: {
      name: string;
    };
    property?: {
      address: string;
    } | null;
  };
  teamMembers: any[];
}

export function JobVisitsSection({ visits, jobInfo, teamMembers }: JobVisitsSectionProps) {
  const router = useRouter();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort visits: Non-completed first (ascending), then completed (descending)
  const nonCompletedVisits = visits
    .filter(v => v.status !== 'Completed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  
  const completedVisits = visits
    .filter(v => v.status === 'Completed')
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.scheduledAt).getTime();
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.scheduledAt).getTime();
      return dateB - dateA;
    });
  
  const sortedVisits = [...nonCompletedVisits, ...completedVisits];

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit({
      ...visit,
      job: jobInfo
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-brand-bg rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="p-6 border-b border-brand-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-text flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand" />
                Visits ({visits.length})
              </h2>
              <p className="text-sm text-brand-text-secondary mt-1">
                Click on any visit to view details
              </p>
            </div>
          </div>
        </div>

        {sortedVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-bg-secondary sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-text uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {sortedVisits.map((visit) => {
                  const isCompleted = visit.status === 'Completed';
                  
                  return (
                    <tr 
                      key={visit.id} 
                      onClick={() => handleVisitClick(visit)}
                      className={`hover:bg-brand-bg-secondary transition-colors cursor-pointer ${
                        isCompleted ? 'opacity-70' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-brand" />
                          <div>
                            <p className="text-sm font-medium text-brand-text">
                              {format(new Date(visit.scheduledAt), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-brand-text-secondary">
                              {format(new Date(visit.scheduledAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          visit.status === 'InProgress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          visit.status === 'Canceled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          visit.status === 'NoShow' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {visit.status}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-4">
                        {Array.isArray(visit.assignees) && visit.assignees.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {visit.assignees.map((userId: string) => {
                              const member = teamMembers.find(m => m.user.id === userId);
                              return member ? (
                                <span key={userId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand/10 text-brand">
                                  {member.user.name.split(' ')[0]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-brand-text-tertiary">Unassigned</span>
                        )}
                      </td>

                      {/* Completed */}
                      <td className="px-6 py-4">
                        {visit.completedAt ? (
                          <p className="text-sm text-brand-text-secondary">
                            {format(new Date(visit.completedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        ) : (
                          <span className="text-sm text-brand-text-tertiary">-</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-6 py-4 max-w-xs">
                        {visit.notes ? (
                          <p className="text-sm text-brand-text-secondary truncate">{visit.notes}</p>
                        ) : (
                          <span className="text-sm text-brand-text-tertiary">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-brand-text-tertiary mx-auto mb-3" />
            <p className="text-brand-text-secondary">No visits scheduled</p>
          </div>
        )}
      </div>

      {/* Visit Edit Modal */}
      <VisitEditModal
        visit={selectedVisit as any}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisit(null);
        }}
        teamMembers={teamMembers}
      />
    </>
  );
}

