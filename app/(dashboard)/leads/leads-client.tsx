'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trash2,
  X,
} from 'lucide-react';
import { createLead, updateLeadStatus, convertLeadToClient, deleteLead } from '@/server/actions/leads';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomSelect } from '@/ui/components/custom-select';

interface Lead {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  addresses: string[];
  source: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  convertedClient: {
    id: string;
    name: string;
  } | null;
}

interface LeadsClientProps {
  leads: Lead[];
}

const statusColors = {
  NEW: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  CONTACTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  QUALIFIED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  PROPOSAL_SENT: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  NEGOTIATION: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  CONVERTED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  LOST: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};

const statusOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

export function LeadsClient({ leads: initialLeads }: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState(initialLeads);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-open modal from URL parameter
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowAddModal(true);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    source: 'Website',
    notes: '',
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead(newLead);
      showSuccess('Lead created successfully!');
      setShowAddModal(false);
      setNewLead({ name: '', email: '', phone: '', address: '', source: 'Website', notes: '' });
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      showSuccess('Status updated successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    if (!confirm('Convert this lead to a client?')) return;

    try {
      const client = await convertLeadToClient(leadId);
      showSuccess(`Lead converted to client successfully!`);
      router.refresh();
      // Optionally redirect to client page
      setTimeout(() => router.push(`/clients/${client.id}`), 1500);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to convert lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;

    try {
      await deleteLead(leadId);
      showSuccess('Lead deleted successfully!');
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete lead');
    }
  };

  const filteredLeads = statusFilter === 'ALL' 
    ? leads 
    : leads.filter(lead => lead.status === statusFilter);

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-7 h-7 mr-2 text-[#4a7c59]" />
            Leads Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Track and convert potential clients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
          <span className="text-green-800 dark:text-green-200">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-red-800 dark:text-red-200">{errorMessage}</span>
        </div>
      )}

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            statusFilter === 'ALL' 
              ? 'bg-[#f7faf7] dark:bg-gray-700 border-[#4a7c59]' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">All Leads</p>
        </button>
        {statusOptions.filter(s => s.value !== 'CONVERTED' && s.value !== 'LOST').map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              statusFilter === status.value 
                ? 'bg-[#f7faf7] dark:bg-gray-700 border-[#4a7c59]' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts[status.value] || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{status.label}</p>
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500">No leads found</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 text-[#4a7c59] hover:text-[#4a8c37] font-medium"
                    >
                      Add your first lead
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                        {lead.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{lead.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.emails[0] && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            {lead.emails[0]}
                          </div>
                        )}
                        {lead.phones[0] && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            {lead.phones[0]}
                          </div>
                        )}
                        {lead.addresses[0] && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            {lead.addresses[0].substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <Tag className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {lead.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.status === 'CONVERTED' && lead.convertedClient ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[lead.status as keyof typeof statusColors]}`}>
                          Converted
                        </span>
                      ) : (
                        <div className="inline-block min-w-[140px]">
                          <CustomSelect
                            value={lead.status}
                            onChange={(value) => handleStatusChange(lead.id, value)}
                            options={statusOptions}
                            className="text-xs"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {new Date(lead.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {lead.status !== 'CONVERTED' && !lead.convertedClient && (
                          <button
                            onClick={() => handleConvertToClient(lead.id)}
                            className="px-3 py-1 text-xs bg-[#4a8c37] text-white rounded hover:bg-[#4a7c59] transition-colors flex items-center"
                          >
                            Convert
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        )}
                        {lead.convertedClient && (
                          <a
                            href={`/clients/${lead.convertedClient.id}`}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 transition-colors flex items-center"
                          >
                            View Client
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Plus className="w-6 h-6 mr-2 text-[#4a7c59]" />
                  Add New Lead
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Capture a potential client</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={newLead.address}
                  onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Source</label>
                <CustomSelect
                  value={newLead.source}
                  onChange={(value) => setNewLead({ ...newLead, source: value })}
                  options={[
                    { value: 'Website', label: 'Website' },
                    { value: 'Referral', label: 'Referral' },
                    { value: 'Social Media', label: 'Social Media' },
                    { value: 'Phone Call', label: 'Phone Call' },
                    { value: 'Email', label: 'Email' },
                    { value: 'Walk-in', label: 'Walk-in' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  placeholder="Select source..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? 'Adding...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
