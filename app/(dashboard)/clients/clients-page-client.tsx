'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Receipt,
  FileText,
  Home,
  ArrowRight,
  Plus,
  X,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/server/actions/clients';
import { useRouter, useSearchParams } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  emails: any;
  phones: any;
  addresses: any;
  createdAt: Date;
  _count: {
    properties: number;
    jobs: number;
    invoices: number;
    estimates: number;
  };
  convertedFromLead: {
    source: string | null;
  } | null;
}

interface ClientsPageClientProps {
  clients: Client[];
  stats: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  orgId: string;
}

export function ClientsPageClient({ clients: initialClients, stats, orgId }: ClientsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
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

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createClient(orgId, {
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
      });
      
      showSuccess('Client created successfully!');
      setShowAddModal(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = initialClients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const emails = Array.isArray(client.emails) ? client.emails : [];
    const phones = Array.isArray(client.phones) ? client.phones : [];
    const addresses = Array.isArray(client.addresses) ? client.addresses : [];

    return (
      client.name.toLowerCase().includes(searchLower) ||
      emails.some((e: string) => e.toLowerCase().includes(searchLower)) ||
      phones.some((p: string) => p.toLowerCase().includes(searchLower)) ||
      addresses.some((a: string) => a.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="w-7 h-7 mr-2 text-brand" />
            Clients
          </h1>
          <p className="text-brand-text-tertiary mt-1">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Client
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-[#4a7c59]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#4a7c59] to-[#4a8c37] rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">New This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newThisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Active (3mo)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search clients by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Showing {filteredClients.length} of {stats.total} clients
        </div>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first client'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-brand text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Client
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Jobs
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Invoices
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => {
                const emails = Array.isArray(client.emails) ? client.emails : [];
                const phones = Array.isArray(client.phones) ? client.phones : [];

                return (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4a7c59] to-[#4a8c37] rounded-full flex items-center justify-center text-white font-bold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            Added {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {emails[0] && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            <span className="truncate">{emails[0]}</span>
                          </div>
                        )}
                        {phones[0] && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            {phones[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold text-sm">
                        {client._count.properties}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-sm">
                        {client._count.jobs}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-sm">
                        {client._count.invoices}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.convertedFromLead?.source && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {client.convertedFromLead.source}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-brand" />
                  Add New Client
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Create a new client record</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
                  placeholder="John Doe / ABC Corporation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-700 placeholder:text-gray-400 dark:text-gray-500"
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}