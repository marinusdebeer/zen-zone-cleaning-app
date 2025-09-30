'use client';

import { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  MapPin,
  ArrowRight,
  Search,
  Repeat
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isRecurring: boolean;
  recurringPattern: string | null;
  estimatedCost: number | null;
  priority: string;
  createdAt: Date;
  client: { name: string };
  property: { address: string } | null;
  visits: { id: string; scheduledAt: Date; status: string }[];
  _count: {
    visits: number;
    invoices: number;
    lineItems: number;
  };
}

interface JobsPageClientProps {
  jobs: Job[];
  statusCounts: Record<string, number>;
  orgId: string;
}

const statusConfig = {
  'Draft': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle },
  'Scheduled': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar },
  'Active': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const priorityConfig = {
  'low': { color: 'text-gray-500', label: 'Low' },
  'normal': { color: 'text-blue-600', label: 'Normal' },
  'high': { color: 'text-orange-600', label: 'High' },
  'urgent': { color: 'text-red-600', label: 'Urgent' },
};

export function JobsPageClient({ jobs, statusCounts, orgId }: JobsPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchLower) ||
      job.client.name.toLowerCase().includes(searchLower) ||
      (job.description && job.description.toLowerCase().includes(searchLower)) ||
      (job.property?.address && job.property.address.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'Active' || j.status === 'Scheduled').length;
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const recurringJobs = jobs.filter(j => j.isRecurring).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Briefcase className="w-7 h-7 mr-2 text-[#4a7c59]" />
            Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your cleaning jobs</p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-[#4a7c59]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-[#4a7c59]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{activeJobs}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{completedJobs}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recurring</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{recurringJobs}</p>
            </div>
            <Repeat className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs by title, client, description, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#4a7c59] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({totalJobs})
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-[#4a7c59] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredJobs.length} of {totalJobs} jobs
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No jobs found' : statusFilter === 'ALL' ? 'No jobs yet' : `No ${statusFilter.toLowerCase()} jobs`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first job'}
          </p>
          {!searchTerm && (
            <Link
              href="/jobs/new"
              className="px-6 py-3 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Next Visit
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Est. Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => {
                const StatusIcon = statusConfig[job.status as keyof typeof statusConfig]?.icon || AlertCircle;
                const nextVisit = job.visits.find(v => v.status === 'SCHEDULED');

                return (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                          {job.isRecurring && (
                            <span title="Recurring job">
                              <Repeat className="w-4 h-4 ml-2 text-purple-600 dark:text-purple-400" />
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{job.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.client.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.property ? (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.property.address}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center ${statusConfig[job.status as keyof typeof statusConfig]?.color || 'bg-gray-100'}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold ${priorityConfig[job.priority as keyof typeof priorityConfig]?.color || 'text-gray-500'}`}>
                        {priorityConfig[job.priority as keyof typeof priorityConfig]?.label || job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-sm">
                        {job._count.visits}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {nextVisit ? (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                          {new Date(nextVisit.scheduledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Not scheduled</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {job.estimatedCost ? (
                        <p className="text-sm font-semibold text-[#4a7c59]">
                          ${job.estimatedCost.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-[#4a7c59] hover:text-[#4a8c37] font-medium text-sm inline-flex items-center"
                      >
                        View
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}