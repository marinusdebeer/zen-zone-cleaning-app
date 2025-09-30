import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/server/db';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Activity, 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Shield
} from 'lucide-react';
import { UserManagementTable } from '@/ui/components/admin/user-management-table';

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) redirect('/auth/signin');
  
  const user = session.user as any;
  if (!user.isSuperAdmin) redirect('/dashboard');

  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: {
          clients: true,
          jobs: true,
          visits: true,
          invoices: true,
          leads: true,
          estimates: true,
          properties: true,
        },
      },
    },
  });

  if (!org) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg">Organization not found</div>
        <Link href="/admin" className="admin-link mt-4 inline-block">
          ← Back to Organizations
        </Link>
      </div>
    );
  }

  // Calculate some derived stats
  const owner = org.memberships.find(m => m.role === 'OWNER');
  const adminCount = org.memberships.filter(m => m.role === 'ADMIN').length;
  const staffCount = org.memberships.filter(m => m.role === 'STAFF').length;
  const totalUsers = org.memberships.length;
  const accountAge = Math.floor((Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/admin" className="admin-link">
          Organizations
        </Link>
        <span className="text-gray-400 dark:text-gray-600">/</span>
        <span className="font-medium">{org.name}</span>
      </div>

      {/* Header with Hero Section */}
      <div className="admin-brand-gradient-hero rounded-xl p-8 shadow-xl border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="admin-brand-gradient-accent w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {org.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{org.name}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="admin-badge-success admin-badge-success-text inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                  {org.industry || 'Cleaning'}
                </span>
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {accountAge} days old
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <Link
              href={`/admin/organizations/${org.id}/edit`}
              className="admin-btn-primary px-4 py-2 rounded-lg inline-flex items-center shadow-lg"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="admin-stat-icon-container p-2 rounded-lg">
              <Calendar className="w-5 h-5 admin-icon-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
              <p className="text-sm font-semibold">
                {new Date(org.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="admin-stat-icon-container p-2 rounded-lg">
              <Users className="w-5 h-5 admin-icon-success" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Team Size</p>
              <p className="text-sm font-semibold">{totalUsers} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="admin-stat-icon-container p-2 rounded-lg">
              <Shield className="w-5 h-5 admin-icon-secondary" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Owner</p>
              <p className="text-sm font-semibold">{owner?.user.name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview - Two Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Metrics */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 admin-icon-success" />
              Business Metrics
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 admin-icon-warning" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Leads</span>
              </div>
              <p className="text-2xl font-bold">{org._count.leads}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 admin-icon-primary" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Clients</span>
              </div>
              <p className="text-2xl font-bold">{org._count.clients}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 admin-icon-secondary" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Estimates</span>
              </div>
              <p className="text-2xl font-bold">{org._count.estimates}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 admin-icon-success" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Properties</span>
              </div>
              <p className="text-2xl font-bold">{org._count.properties}</p>
            </div>
          </div>
        </div>

        {/* Operations Metrics */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Briefcase className="w-5 h-5 mr-2 admin-icon-primary" />
              Operations
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-5 h-5 admin-icon-primary" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Jobs</span>
              </div>
              <p className="text-2xl font-bold">{org._count.jobs}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 admin-icon-info" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Visits</span>
              </div>
              <p className="text-2xl font-bold">{org._count.visits}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 admin-icon-warning" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Invoices</span>
              </div>
              <p className="text-2xl font-bold">{org._count.invoices}</p>
            </div>
            <div className="admin-card-secondary">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 admin-icon-success" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Team</span>
              </div>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 admin-icon-primary" />
          Team Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--admin-secondary)' }}>Owners</p>
                <p className="text-3xl font-bold mt-1">1</p>
              </div>
              <div className="admin-stat-icon-container w-12 h-12 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 admin-icon-secondary" />
              </div>
            </div>
          </div>
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--admin-primary)' }}>Admins</p>
                <p className="text-3xl font-bold mt-1">{adminCount}</p>
              </div>
              <div className="admin-stat-icon-container w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 admin-icon-primary" />
              </div>
            </div>
          </div>
          <div className="admin-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--admin-success)' }}>Staff</p>
                <p className="text-3xl font-bold mt-1">{staffCount}</p>
              </div>
              <div className="admin-stat-icon-container w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 admin-icon-success" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management - Interactive */}
      <UserManagementTable memberships={org.memberships as any} orgId={org.id} />

      {/* Organization Info */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold mb-4">Organization Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Organization ID</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
              {org.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">URL Slug</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
              /{org.slug}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created Date</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
              {new Date(org.createdAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
              {new Date(org.updatedAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="admin-card-secondary">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 admin-icon-info mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold mb-1">Privacy & Data Protection</h3>
            <p className="text-sm">
              As a super administrator, you can see high-level metrics and manage users. 
              Sensitive business data (client details, job specifics, invoice amounts, payment information) 
              remains private to the organization and is not accessible here. Organization owners have 
              full access to their data through their own dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
