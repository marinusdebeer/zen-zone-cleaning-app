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
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="mt-1">Manage all organizations across the platform</p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="admin-btn-primary inline-flex items-center px-6 py-3 rounded-lg shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Organization
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--admin-bg)', borderWidth: '1px', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Organizations</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--admin-text-primary)' }}>{totalOrgs}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
              <Building className="h-6 w-6" style={{ color: 'var(--admin-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--admin-bg)', borderWidth: '1px', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Total Users</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--admin-text-primary)' }}>{totalUsers}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
              <Users className="h-6 w-6" style={{ color: 'var(--admin-success)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--admin-bg)', borderWidth: '1px', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Total Clients</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--admin-text-primary)' }}>{totalClients}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
              <Users className="h-6 w-6" style={{ color: 'var(--admin-secondary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--admin-bg)', borderWidth: '1px', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Total Jobs</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--admin-text-primary)' }}>{totalJobs}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
              <Briefcase className="h-6 w-6" style={{ color: 'var(--admin-warning)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="admin-card overflow-hidden">
        <div className="pb-6 border-b admin-border">
          <h2 className="text-xl font-semibold">Organizations</h2>
          <p className="text-sm mt-1">Click "View Details" to see organization data</p>
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="text-left">Organization</th>
                <th className="text-left">Industry</th>
                <th className="text-left">Created</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="admin-brand-gradient-accent w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{org.name}</p>
                        <p className="text-xs admin-text-tertiary">/{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="admin-badge-secondary-bg inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                      {org.industry || 'cleaning'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">
                      {new Date(org.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs admin-text-tertiary">
                      {new Date(org.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="admin-badge-success admin-badge-success-text inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="admin-btn-primary inline-flex items-center px-4 py-2 text-sm rounded-lg"
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
            <div className="admin-bg text-center py-12">
              <Building className="w-12 h-12 mx-auto mb-4 admin-text-tertiary" />
              <p>No organizations yet</p>
              <Link
                href="/admin/organizations/new"
                className="admin-btn-primary inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg mt-4"
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
