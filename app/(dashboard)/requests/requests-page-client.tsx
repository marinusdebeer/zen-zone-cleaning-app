/**
 * REQUESTS PAGE CLIENT COMPONENT
 */

'use client';

import { useState } from 'react';
import { FileText, Plus, Search, Clock, CheckCircle, Users, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getClientDisplayName } from '@/lib/client-utils';

interface Request {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: string;
  urgency: string;
  source: string | null;
  createdAt: Date | string;
  client: { 
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    clientStatus: string;
  };
  property: { address: string } | null;
  industry?: { label: string } | null;
  serviceType?: { label: string } | null;
  details?: any;
}

interface RequestsPageClientProps {
  requests: Request[];
}

export function RequestsPageClient({ requests }: RequestsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const clientName = getClientDisplayName(req.client);
    return (
      req.title.toLowerCase().includes(searchLower) ||
      (req.description && req.description.toLowerCase().includes(searchLower)) ||
      clientName.toLowerCase().includes(searchLower) ||
      (req.client.firstName?.toLowerCase() || '').includes(searchLower) ||
      (req.client.lastName?.toLowerCase() || '').includes(searchLower) ||
      (req.client.companyName?.toLowerCase() || '').includes(searchLower)
    );
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'normal': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'low': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'CONTACTED': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'QUOTED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'CONVERTED': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'DECLINED': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {requests.length} total request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center px-4 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </Link>
      </div>

      {/* Search */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-brand-bg rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Received
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No requests found' : 'No requests yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr 
                    key={request.id} 
                    onClick={() => window.location.href = `/requests/${request.id}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </p>
                      {request.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {request.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{getClientDisplayName(request.client)}</p>
                        {request.property && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {request.property.address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {new Date(request.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

