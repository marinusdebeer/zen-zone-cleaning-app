import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Briefcase, 
  CheckCircle,
  Clock,
  AlertCircle 
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

  // Get some basic stats (these will be mock data for now)
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$12,450</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-[#4a8c37] mr-1" />
                <span className="text-sm text-[#4a8c37]">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <DollarSign className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        {/* Active Clients Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">48</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">5 new this month</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Users className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        {/* Jobs This Week Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">23</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">8 completed</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Briefcase className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        {/* Upcoming Jobs Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tomorrow's Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">6</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">First at 8:00 AM</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Calendar className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Jobs</h2>
              <Link href="/jobs" className="text-sm text-[#4a7c59] hover:text-[#4a8c37]">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Job Item 1 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-[#f7faf7] rounded">
                  <Clock className="h-5 w-5 text-[#4a7c59]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Johnson - Home Cleaning</p>
                  <p className="text-sm text-gray-500">Tomorrow, 9:00 AM - 123 Main St, Barrie</p>
                </div>
              </div>
              <Link href="/jobs/123" className="text-[#4a8c37] hover:text-[#4a7c59]">
                View
              </Link>
            </div>

            {/* Job Item 2 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-[#f7faf7] rounded">
                  <Clock className="h-5 w-5 text-[#4a7c59]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mike's Office - Commercial Clean</p>
                  <p className="text-sm text-gray-500">Tomorrow, 2:00 PM - 456 Business Blvd</p>
                </div>
              </div>
              <Link href="/jobs/124" className="text-[#4a8c37] hover:text-[#4a7c59]">
                View
              </Link>
            </div>

            {/* Job Item 3 */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending: Lisa Chen - Deep Clean</p>
                  <p className="text-sm text-gray-500">Needs confirmation - Requested for Thursday</p>
                </div>
              </div>
              <Link href="/jobs/125" className="text-[#4a8c37] hover:text-[#4a7c59]">
                Review
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/jobs/new"
                className="w-full flex items-center justify-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
              >
                Create New Job
              </Link>
              <Link 
                href="/clients/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-[#4a7c59] text-[#4a7c59] rounded-lg hover:bg-[#f7faf7] transition-colors"
              >
                Add New Client
              </Link>
              <Link 
                href="/invoices/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-[#4a7c59] text-[#4a7c59] rounded-lg hover:bg-[#f7faf7] transition-colors"
              >
                Create Invoice
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-green-100 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Job completed</p>
                  <p className="text-xs text-gray-500">Johnson residence - 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 rounded">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">Invoice #1234 - $250.00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-purple-100 rounded">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New client added</p>
                  <p className="text-xs text-gray-500">Emily Watson - Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}