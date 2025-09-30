import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/server/db';
import Link from 'next/link';
import { Building, Users, Briefcase, DollarSign, Plus, ExternalLink } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check super admin
  const user = session.user as any;
  if (!user.isSuperAdmin) {
    redirect('/dashboard');
  }

  // Get all organizations (minimal data for privacy)
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          memberships: true,
          clients: true,
          jobs: true,
          invoices: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalOrgs = organizations.length;
  const totalClients = organizations.reduce((sum, org) => sum + org._count.clients, 0);
  const totalJobs = organizations.reduce((sum, org) => sum + org._count.jobs, 0);
  const totalUsers = organizations.reduce((sum, org) => sum + org._count.memberships, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 mt-1">Manage all organizations across the platform</p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Organization
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Organizations</p>
              <p className="text-3xl font-bold text-white mt-2">{totalOrgs}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Building className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Users className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Clients</p>
              <p className="text-3xl font-bold text-white mt-2">{totalClients}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Jobs</p>
              <p className="text-3xl font-bold text-white mt-2">{totalJobs}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Briefcase className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Organizations</h2>
          <p className="text-sm text-gray-400 mt-1">Click "View Details" to see organization data</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Organization
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Industry
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Created
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{org.name}</p>
                        <p className="text-xs text-gray-400">/{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                      {org.industry || 'cleaning'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {new Date(org.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(org.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-600">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No organizations yet</p>
              <Link
                href="/admin/organizations/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Organization
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
