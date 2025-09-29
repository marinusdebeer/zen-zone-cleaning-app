import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, Plus } from 'lucide-react';

export default async function SchedulePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock schedule data - will be replaced with real data
  const today = new Date();
  const scheduledJobs = [
    {
      id: '1',
      title: 'Home Cleaning - Johnson Residence',
      client: 'Sarah Johnson',
      address: '123 Main St, Barrie',
      time: '9:00 AM - 11:00 AM',
      assignee: 'Team A',
      status: 'scheduled',
      date: new Date(today.setHours(9, 0)),
    },
    {
      id: '2',
      title: 'Office Clean - Mike\'s Business',
      client: 'Mike Chen',
      address: '456 Business Blvd, Barrie',
      time: '2:00 PM - 4:00 PM',
      assignee: 'Team B',
      status: 'in-progress',
      date: new Date(today.setHours(14, 0)),
    },
    {
      id: '3',
      title: 'Deep Clean - Lisa\'s Place',
      client: 'Lisa Chen',
      address: '789 Oak Ave, Barrie',
      time: '10:00 AM - 1:00 PM',
      assignee: 'Team A',
      status: 'scheduled',
      date: new Date(today.setDate(today.getDate() + 1)),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group jobs by date
  const jobsByDate = scheduledJobs.reduce((acc, job) => {
    const dateKey = job.date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(job);
    return acc;
  }, {} as Record<string, typeof scheduledJobs>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">View and manage your daily schedule</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Job
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {scheduledJobs.filter(j => j.date.toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Calendar className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {scheduledJobs.filter(j => j.status === 'in-progress').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {scheduledJobs.filter(j => j.date > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">This Week's Schedule</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Day
              </button>
              <button className="px-3 py-1 text-sm bg-[#4a7c59] text-white rounded-lg">
                Week
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Month
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {Object.keys(jobsByDate).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled jobs</p>
              <p className="text-sm text-gray-400 mt-1">
                Schedule jobs to see them here
              </p>
              <Link
                href="/jobs/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Schedule Job
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(jobsByDate).map(([dateKey, jobs]) => (
                <div key={dateKey}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {new Date(dateKey).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div 
                        key={job.id} 
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(job.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{job.time}</span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mt-2 ml-8">
                              {job.title}
                            </h4>
                            
                            <div className="mt-2 ml-8 space-y-1">
                              <p className="text-sm text-gray-600 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {job.client}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {job.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Team:</strong> {job.assignee}
                              </p>
                            </div>
                          </div>
                          
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-[#4a7c59] hover:text-[#4a8c37] text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
