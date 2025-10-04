/**
 * ⚠️ MODULAR DESIGN REMINDER
 * Keep this file under500lines. Extract components early!
 * See docs/MODULAR_DESIGN.md for guidelines.
 * 
 * Suggested extractions when needed:
 * - Calendar wrapper/controls component
 * - Filter panel component
 * - View mode selector component
 */

'use client';

import { useState } from 'react';
import { Calendar } from '@/ui/components/calendar';
import { FullPageWrapper } from '@/ui/components/full-page-wrapper';
import { VisitEditModal } from '@/ui/components/visit-edit-modal';

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Service {
  name: string;
  defaultPrice?: number;
}

interface Job {
  id: string;
  title: string;
  client: string;
  address: string;
  startTime: Date;
  endTime: Date;
  assignee: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending';
  color?: string;
}

interface ScheduleClientProps {
  clients: Client[];
  teamMembers: TeamMember[];
  services: Service[];
  orgId: string;
  initialJobs: Job[];
}

export function ScheduleClient({ 
  clients, 
  teamMembers, 
  services, 
  orgId,
  initialJobs 
}: ScheduleClientProps) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJobCreate = (jobData: any) => {
    // Create new job with unique ID
    const newJob = {
      id: `job-${Date.now()}`,
      title: jobData.title,
      client: jobData.client,
      address: jobData.address,
      startTime: jobData.startTime,
      endTime: jobData.endTime,
      assignee: jobData.team,
      status: 'scheduled' as const,
    };

    // Add to jobs list
    setJobs(prev => [...prev, newJob]);
    
    console.log('New job created:', newJob);
  };

  const handleVisitClick = (visitId: string, visitData?: any) => {
    if (visitData) {
      setSelectedVisit(visitData);
      setIsModalOpen(true);
    }
  };

  return (
    <FullPageWrapper>
      <Calendar
        jobs={jobs}
        view={view}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onJobCreate={handleJobCreate}
        onVisitClick={handleVisitClick}
        clients={clients}
        teamMembers={teamMembers}
        services={services}
        orgId={orgId}
      />
      
      <VisitEditModal
        visit={selectedVisit}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisit(null);
        }}
        teamMembers={teamMembers}
      />
    </FullPageWrapper>
  );
}
