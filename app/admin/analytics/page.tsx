import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from '@/server/db';
import Link from 'next/link';
import { TrendingUp, DollarSign, Users, Briefcase, Building, Calendar } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user) redirect('/auth/signin');
  
  const user = session.user as any;
  if (!user.isSuperAdmin) redirect('/dashboard');

  // Get system-wide stats
  const totalOrgs = await prisma.organization.count();
  const totalClients = await prisma.client.count();
  const totalJobs = await prisma.job.count();
  const totalVisits = await prisma.visit.count();
  const totalInvoices = await prisma.invoice.count();
  
  // Get revenue data
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'Paid' },
    select: { total: true },
  });
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total.toString()), 0);

  // Get org breakdown
  const orgStats = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          clients: true,
          jobs: true,
          invoices: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Analytics</h1>
        <p className="mt-1">Platform-wide performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 mr-1 admin-icon-success" />
                <span className="text-sm admin-icon-success">All time</span>
              </div>
            </div>
            <div className="admin-stat-icon-container">
              <DollarSign className="h-6 w-6 admin-icon-success" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold mt-2">{totalClients}</p>
              <p className="text-sm mt-2">Across {totalOrgs} orgs</p>
            </div>
            <div className="admin-stat-icon-container">
              <Users className="h-6 w-6 admin-icon-primary" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{totalJobs}</p>
              <p className="text-sm mt-2">{totalVisits} visits</p>
            </div>
            <div className="admin-stat-icon-container">
              <Briefcase className="h-6 w-6 admin-icon-secondary" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Invoices</p>
              <p className="text-3xl font-bold mt-2">{totalInvoices}</p>
              <p className="text-sm mt-2">{paidInvoices.length} paid</p>
            </div>
            <div className="admin-stat-icon-container">
              <Calendar className="h-6 w-6 admin-icon-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Breakdown */}
      <div className="admin-card">
        <h2 className="text-xl font-semibold mb-6">Organization Performance</h2>
        <div className="space-y-4">
          {orgStats.map((org) => (
            <div key={org.id} className="admin-card-secondary">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{org.name}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs">Clients</p>
                      <p className="text-xl font-bold">{org._count.clients}</p>
                    </div>
                    <div>
                      <p className="text-xs">Jobs</p>
                      <p className="text-xl font-bold">{org._count.jobs}</p>
                    </div>
                    <div>
                      <p className="text-xs">Invoices</p>
                      <p className="text-xl font-bold">{org._count.invoices}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="admin-btn-primary px-4 py-2 text-sm rounded-lg"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="admin-card">
        <h2 className="text-xl font-semibold mb-6">Platform Growth</h2>
        <div className="h-64 flex items-end justify-around space-x-2">
          {[120, 145, 178, 210, 234, 289].map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full rounded-t-lg admin-chart-bar"
                style={{ height: `${(value / 289) * 100}%` }}
              ></div>
              <span className="text-xs mt-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
              </span>
              <span className="text-xs admin-text-tertiary">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-4">Total Jobs Created Per Month</p>
      </div>
    </div>
  );
}
