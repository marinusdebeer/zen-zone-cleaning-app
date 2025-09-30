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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with {org.name} today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-[#4a7c59]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {lastRevenue > 0 && (
                <div className="flex items-center mt-2">
                  {Number(revenueChange) >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-[#4a8c37] mr-1" />
                      <span className="text-sm text-[#4a8c37]">+{revenueChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">{revenueChange}%</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-gradient-to-br from-[#4a7c59] to-[#4a8c37] rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Clients Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalClients}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{newClientsThisMonth} new this month</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Visits This Week Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visits This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{visitsThisWeek}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{completedVisitsThisWeek} completed</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Tomorrow's Visits Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tomorrow's Visits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{visitsTomorrow}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {upcomingVisits[0] 
                    ? `First at ${upcomingVisits[0].scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                    : 'No visits scheduled'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Active Leads</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{activeLeads}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">of {totalLeads} total</p>
            </div>
            <UserPlus className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Invoices Paid</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{paidInvoices}</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">of {totalInvoices} total</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Pending Amount</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                ${Number(pendingInvoicesAmount._sum.total || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">awaiting payment</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Visits List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#4a7c59]" />
                Upcoming Visits
              </h2>
              <Link href="/schedule" className="text-sm text-[#4a7c59] hover:text-[#4a8c37] font-medium inline-flex items-center">
                View Calendar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        visit.status === 'SCHEDULED' ? 'bg-blue-100' :
                        visit.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <Clock className={`h-5 w-5 ${
                          visit.status === 'SCHEDULED' ? 'text-blue-600' :
                          visit.status === 'IN_PROGRESS' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {visit.job.client.name} - {visit.job.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                      className="text-[#4a8c37] hover:text-[#4a7c59] font-medium text-sm whitespace-nowrap ml-4"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming visits scheduled</p>
                <Link 
                  href="/jobs/new"
                  className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#4a7c59]" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link 
                href="/jobs/new"
                className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#4a8c37] to-[#4a7c59] text-white rounded-lg hover:from-[#4a7c59] hover:to-[#4a8c37] transition-all shadow-sm font-medium"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Create New Job
              </Link>
              <Link 
                href="/leads"
                className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-[#4a7c59] text-[#4a7c59] dark:text-[#78A265] dark:border-[#78A265] rounded-lg hover:bg-[#f7faf7] dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Lead
              </Link>
              <Link 
                href="/clients"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <Users className="w-4 h-4 mr-2" />
                View Clients
              </Link>
              <Link 
                href="/invoices"
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Invoices
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#4a7c59]" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentInvoices.slice(0, 2).map((invoice) => (
                <Link 
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors -m-2"
                >
                  <div className={`p-1.5 rounded ${
                    invoice.status === 'PAID' ? 'bg-green-100' :
                    invoice.status === 'SENT' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <Receipt className={`h-4 w-4 ${
                      invoice.status === 'PAID' ? 'text-green-600' :
                      invoice.status === 'SENT' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Invoice {invoice.status === 'PAID' ? 'paid' : invoice.status.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {invoice.client.name} - ${Number(invoice.total).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
              
              {recentClients.slice(0, 2).map((client) => (
                <Link 
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors -m-2"
                >
                  <div className="p-1.5 bg-purple-100 rounded">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">New client added</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {client.name} - {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}

              {recentInvoices.length === 0 && recentClients.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}