'use client';

import { useState } from 'react';
import { Calendar } from '@/ui/components/calendar';

export default function SchedulePage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock jobs data - will be replaced with real data from database
  const [jobs, setJobs] = useState([
    {
      id: '1',
      title: 'Home Deep Clean',
      client: 'Sarah Johnson',
      address: '123 Main St, Barrie, ON',
      startTime: new Date(2025, 0, 29, 9, 0),
      endTime: new Date(2025, 0, 29, 11, 0),
      assignee: 'Team A',
      status: 'scheduled' as const,
    },
    {
      id: '2',
      title: 'Office Cleaning',
      client: 'Tech Corp',
      address: '456 Business Blvd, Barrie, ON',
      startTime: new Date(2025, 0, 29, 14, 0),
      endTime: new Date(2025, 0, 29, 16, 0),
      assignee: 'Team B',
      status: 'scheduled' as const,
    },
    {
      id: '3',
      title: 'Move Out Clean',
      client: 'Mike Chen',
      address: '789 Oak Ave, Barrie, ON',
      startTime: new Date(2025, 0, 29, 10, 0),
      endTime: new Date(2025, 0, 29, 13, 0),
      assignee: 'Team A',
      status: 'in-progress' as const,
    },
    {
      id: '4',
      title: 'Post-Construction',
      client: 'BuildCo',
      address: '321 Pine St, Barrie, ON',
      startTime: new Date(2025, 0, 30, 8, 0),
      endTime: new Date(2025, 0, 30, 12, 0),
      assignee: 'Team B',
      status: 'scheduled' as const,
    },
    {
      id: '5',
      title: 'Regular Maintenance',
      client: 'Lisa Davis',
      address: '555 Maple Dr, Barrie, ON',
      startTime: new Date(2025, 0, 30, 13, 0),
      endTime: new Date(2025, 0, 30, 15, 0),
      assignee: 'Team A',
      status: 'scheduled' as const,
    },
    {
      id: '6',
      title: 'Commercial Clean',
      client: 'RestaurantCo',
      address: '888 Commercial Rd, Barrie, ON',
      startTime: new Date(2025, 0, 31, 10, 0),
      endTime: new Date(2025, 0, 31, 14, 0),
      assignee: 'Team B',
      status: 'scheduled' as const,
    },
    {
      id: '7',
      title: 'Window Cleaning',
      client: 'Glass Tower Inc',
      address: '999 High Rise Ave, Barrie, ON',
      startTime: new Date(2025, 1, 1, 9, 0),
      endTime: new Date(2025, 1, 1, 11, 30),
      assignee: 'Team A',
      status: 'scheduled' as const,
    },
    {
      id: '8',
      title: 'Emergency Clean',
      client: 'Urgent Client',
      address: '111 Quick St, Barrie, ON',
      startTime: new Date(2025, 0, 29, 16, 30),
      endTime: new Date(2025, 0, 29, 18, 0),
      assignee: 'Team B',
      status: 'pending' as const,
    },
  ]);

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
    
    // TODO: Save to database via server action
    console.log('New job created:', newJob);
  };

  return (
    <div className="fixed inset-0 top-16 left-0 lg:left-64 right-0 bottom-0">
      {/* Calendar - Full Screen */}
      <Calendar
        jobs={jobs}
        view={view}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onJobCreate={handleJobCreate}
      />
    </div>
  );
}