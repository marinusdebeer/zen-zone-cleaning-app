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
        <h1 className="text-2xl font-bold text-white">System Analytics</h1>
        <p className="text-gray-400 mt-1">Platform-wide performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">All time</span>
              </div>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Clients</p>
              <p className="text-3xl font-bold text-white mt-2">{totalClients}</p>
              <p className="text-sm text-gray-400 mt-2">Across {totalOrgs} orgs</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Jobs</p>
              <p className="text-3xl font-bold text-white mt-2">{totalJobs}</p>
              <p className="text-sm text-gray-400 mt-2">{totalVisits} visits</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Invoices</p>
              <p className="text-3xl font-bold text-white mt-2">{totalInvoices}</p>
              <p className="text-sm text-gray-400 mt-2">{paidInvoices.length} paid</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Organization Performance</h2>
        <div className="space-y-4">
          {orgStats.map((org) => (
            <div key={org.id} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{org.name}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Clients</p>
                      <p className="text-xl font-bold text-white">{org._count.clients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Jobs</p>
                      <p className="text-xl font-bold text-white">{org._count.jobs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Invoices</p>
                      <p className="text-xl font-bold text-white">{org._count.invoices}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Platform Growth</h2>
        <div className="h-64 flex items-end justify-around space-x-2">
          {[120, 145, 178, 210, 234, 289].map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-500"
                style={{ height: `${(value / 289) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-400 mt-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
              </span>
              <span className="text-xs text-gray-500">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">Total Jobs Created Per Month</p>
      </div>
    </div>
  );
}
