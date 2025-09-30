'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Users,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Estimate {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  validUntil: Date | null;
  createdAt: Date;
  client: { name: string } | null;
  lead: { name: string } | null;
  property: { address: string } | null;
  convertedJob: { id: string; title: string } | null;
}

interface EstimatesPageClientProps {
  estimates: Estimate[];
  statusCounts: Record<string, number>;
  stats: {
    total: number;
    totalValue: number;
  };
}

const statusConfig = {
  'DRAFT': { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600', icon: FileText },
  'SENT': { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: Clock },
  'APPROVED': { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800', icon: CheckCircle },
  'REJECTED': { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800', icon: XCircle },
  'EXPIRED': { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600', icon: XCircle },
  'CONVERTED': { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: CheckCircle },
};

export function EstimatesPageClient({ estimates, statusCounts, stats }: EstimatesPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEstimates = estimates.filter(estimate => {
    const matchesStatus = statusFilter === 'ALL' || estimate.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      estimate.title.toLowerCase().includes(searchLower) ||
      (estimate.client?.name && estimate.client.name.toLowerCase().includes(searchLower)) ||
      (estimate.lead?.name && estimate.lead.name.toLowerCase().includes(searchLower)) ||
      (estimate.description && estimate.description.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="w-7 h-7 mr-2 text-brand" />
            Estimates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage quotes and service estimates</p>
        </div>
        <Link
          href="/estimates/new"
          className="px-4 py-2 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Estimate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-[#4a7c59]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Estimates</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-brand" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statusCounts['SENT'] || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
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
            placeholder="Search estimates by title, client, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-brand text-white'
                : 'bg-brand-bg-secondary hover:bg-brand-bg-tertiary'
            }`}
          >
            All ({stats.total})
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-brand text-white'
                  : 'bg-brand-bg-secondary hover:bg-brand-bg-tertiary'
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredEstimates.length} of {stats.total} estimates
        </div>
      </div>

      {/* Estimates Table */}
      {filteredEstimates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No estimates found' : 'No estimates yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first estimate to provide quotes to clients'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Estimate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Client/Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEstimates.map((estimate) => {
                const StatusIcon = statusConfig[estimate.status as keyof typeof statusConfig]?.icon || FileText;

                return (
                  <tr key={estimate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{estimate.title}</p>
                        {estimate.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{estimate.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {estimate.client?.name || estimate.lead?.name || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {estimate.property ? (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{estimate.property.address}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center ${statusConfig[estimate.status as keyof typeof statusConfig]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {estimate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {estimate.validUntil ? (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                          {new Date(estimate.validUntil).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-brand">
                        ${estimate.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/estimates/${estimate.id}`}
                        className="text-brand hover:text-brand-dark font-medium text-sm inline-flex items-center"
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
