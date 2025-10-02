import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Calendar, 
  Briefcase, 
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  UserPlus,
  Receipt,
  ArrowRight,
  Activity
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { name: true, industry: true, slug: true }
  });

  if (!org) {
    return <div>Organization not found</div>;
  }

  // Get current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  // Fetch real stats
  const [
    totalClients,
    newClientsThisMonth,
    totalJobs,
    visitsThisWeek,
    completedVisitsThisWeek,
    visitsTomorrow,
    totalInvoices,
    paidInvoices,
    pendingInvoicesAmount,
    totalLeads,
    activeLeads,
    upcomingVisits,
    recentInvoices,
    recentClients
  ] = await Promise.all([
    // Total clients
    prisma.client.count({
      where: { orgId: selectedOrgId }
    }),
    // New clients this month
    prisma.client.count({
      where: { 
        orgId: selectedOrgId,
        createdAt: { gte: startOfMonth }
      }
    }),
    // Total jobs
    prisma.job.count({
      where: { orgId: selectedOrgId }
    }),
    // Visits this week
    prisma.visit.count({
      where: { 
        orgId: selectedOrgId,
        scheduledAt: { gte: startOfWeek }
      }
    }),
    // Completed visits this week
    prisma.visit.count({
      where: { 
        orgId: selectedOrgId,
        scheduledAt: { gte: startOfWeek },
        status: 'COMPLETED'
      }
    }),
    // Visits tomorrow
    prisma.visit.count({
      where: { 
        orgId: selectedOrgId,
        scheduledAt: { 
          gte: tomorrow,
          lt: endOfTomorrow
        }
      }
    }),
    // Total invoices
    prisma.invoice.count({
      where: { orgId: selectedOrgId }
    }),
    // Paid invoices
    prisma.invoice.count({
      where: { 
        orgId: selectedOrgId,
        status: 'PAID'
      }
    }),
    // Pending invoices amount
    prisma.invoice.aggregate({
      where: {
        orgId: selectedOrgId,
        status: { in: ['DRAFT', 'SENT'] }
      },
      _sum: { total: true }
    }),
    // Total leads
    prisma.lead.count({
      where: { orgId: selectedOrgId }
    }),
    // Active leads (not converted or lost)
    prisma.lead.count({
      where: { 
        orgId: selectedOrgId,
        status: { notIn: ['CONVERTED', 'LOST'] }
      }
    }),
    // Upcoming visits (next 7)
    prisma.visit.findMany({
      where: {
        orgId: selectedOrgId,
        scheduledAt: { gte: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      },
      include: {
        job: {
          include: {
            client: { select: { name: true } },
            property: { select: { address: true } }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 7
    }),
    // Recent invoices
    prisma.invoice.findMany({
      where: { orgId: selectedOrgId },
      include: {
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    }).then(invoices => invoices.map(inv => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      total: Number(inv.total),
    }))),
    // Recent clients
    prisma.client.findMany({
      where: { orgId: selectedOrgId },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ]);

  // Calculate revenue (sum of paid invoices)
  const revenueThisMonth = await prisma.invoice.aggregate({
    where: {
      orgId: selectedOrgId,
      status: 'PAID',
      paidAt: { gte: startOfMonth }
    },
    _sum: { total: true }
  });

  const revenueLastMonth = await prisma.invoice.aggregate({
    where: {
      orgId: selectedOrgId,
      status: 'PAID',
      paidAt: { 
        gte: startOfLastMonth,
        lte: endOfLastMonth
      }
    },
    _sum: { total: true }
  });

  const currentRevenue = Number(revenueThisMonth._sum.total || 0);
  const lastRevenue = Number(revenueLastMonth._sum.total || 0);
  const revenueChange = lastRevenue > 0 
    ? ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1)
    : '0';

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1">Welcome back! Here's what's happening with {org.name} today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Revenue This Month</p>
              <p className="text-2xl font-bold mt-2">
                ${currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {lastRevenue > 0 && (
                <div className="flex items-center mt-2">
                  {Number(revenueChange) >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-brand mr-1" />
                      <span className="text-sm text-brand">+{revenueChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-brand-danger mr-1" />
                      <span className="text-sm text-brand-danger">{revenueChange}%</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-brand to-brand-accent p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Clients Card */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-brand-info">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold mt-2">{totalClients}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-brand-text-tertiary">{newClientsThisMonth} new this month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(to bottom right, var(--tenant-info), var(--tenant-info))' }}>
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Visits This Week Card */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-brand-accent">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Visits This Week</p>
              <p className="text-2xl font-bold mt-2">{visitsThisWeek}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-brand-text-tertiary">{completedVisitsThisWeek} completed</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand to-brand-accent p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Tomorrow's Visits Card */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-brand-warning">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Tomorrow's Visits</p>
              <p className="text-2xl font-bold mt-2">{visitsTomorrow}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-brand-text-tertiary">
                  {upcomingVisits[0] 
                    ? `First at ${upcomingVisits[0].scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                    : 'No visits scheduled'}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(to bottom right, var(--tenant-warning), var(--tenant-warning))' }}>
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))', borderColor: 'var(--tenant-warning)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-warning">Active Leads</p>
              <p className="text-3xl font-bold mt-2">{activeLeads}</p>
              <p className="text-xs mt-1">of {totalLeads} total</p>
            </div>
            <UserPlus className="h-8 w-8 text-brand-warning" />
          </div>
        </div>

        <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', borderColor: 'var(--tenant-success)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-success">Invoices Paid</p>
              <p className="text-3xl font-bold mt-2">{paidInvoices}</p>
              <p className="text-xs mt-1">of {totalInvoices} total</p>
            </div>
            <CheckCircle className="h-8 w-8 text-brand-success" />
          </div>
        </div>

        <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', borderColor: 'var(--tenant-danger)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-danger">Pending Amount</p>
              <p className="text-3xl font-bold mt-2">
                ${Number(pendingInvoicesAmount._sum.total || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs mt-1">awaiting payment</p>
            </div>
            <AlertCircle className="h-8 w-8 text-brand-danger" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Visits List */}
        <div className="lg:col-span-2 bg-brand-bg border border-brand-border rounded-xl shadow-sm hover:shadow-md transition-shadow p-0">
          <div className="p-6 border-b border-brand-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand" />
                Upcoming Visits
              </h2>
              <Link href="/schedule" className="text-sm text-brand hover:text-brand-dark font-medium inline-flex items-center">
                View Calendar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-4 bg-brand-bg-secondary rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        visit.status === 'SCHEDULED' ? 'bg-brand-bg-tertiary' :
                        visit.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <Clock className={`h-5 w-5 ${
                          visit.status === 'SCHEDULED' ? 'text-brand' :
                          visit.status === 'IN_PROGRESS' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-brand-text-tertiary'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {visit.job.client.name} - {visit.job.title}
                        </p>
                        <p className="text-sm text-brand-text-tertiary truncate">
                          {visit.scheduledAt.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                          {visit.job.property?.address && ` - ${visit.job.property.address.substring(0, 30)}...`}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={`/jobs/${visit.job.id}`} 
                      className="text-brand hover:text-brand-dark font-medium text-sm whitespace-nowrap ml-4"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-brand-text-tertiary mx-auto mb-3" />
                <p className="mb-4">No upcoming visits scheduled</p>
                <Link 
                  href="/jobs/new"
                  className="bg-brand text-white font-semibold inline-flex items-center px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark"
                >
                  Schedule New Job
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-brand" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link 
                href="/jobs/new"
                className="bg-brand text-white font-semibold w-full flex items-center justify-center px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Create New Job
              </Link>
              <Link 
                href="/leads"
                className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-brand text-brand rounded-lg hover:bg-brand-bg-secondary transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Lead
              </Link>
              <Link 
                href="/clients"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-brand-border rounded-lg hover:bg-brand-bg-secondary transition-colors font-medium"
              >
                <Users className="w-4 h-4 mr-2" />
                View Clients
              </Link>
              <Link 
                href="/invoices"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-brand-border rounded-lg hover:bg-brand-bg-secondary transition-colors font-medium"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Invoices
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-brand" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentInvoices.slice(0, 2).map((invoice) => (
                <Link 
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-start space-x-3 hover:bg-brand-bg-secondary p-2 rounded-lg transition-colors -m-2"
                >
                  <div className={`p-1.5 rounded ${
                    invoice.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30' :
                    invoice.status === 'SENT' ? 'bg-brand-bg-tertiary' :
                    'bg-brand-bg-secondary'
                  }`}>
                    <Receipt className={`h-4 w-4 ${
                      invoice.status === 'PAID' ? 'text-green-600 dark:text-green-400' :
                      invoice.status === 'SENT' ? 'text-brand' :
                      'text-brand-text-tertiary'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Invoice {invoice.status === 'PAID' ? 'paid' : invoice.status.toLowerCase()}
                    </p>
                    <p className="text-xs text-brand-text-tertiary truncate">
                      {invoice.client.name} - ${Number(invoice.total).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
              
              {recentClients.slice(0, 2).map((client) => (
                <Link 
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-start space-x-3 hover:bg-brand-bg-secondary p-2 rounded-lg transition-colors -m-2"
                >
                  <div className="p-1.5 bg-brand-bg-tertiary rounded">
                    <UserPlus className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">New client added</p>
                    <p className="text-xs text-brand-text-tertiary truncate">
                      {client.name} - {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}

              {recentInvoices.length === 0 && recentClients.length === 0 && (
                <p className="text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}