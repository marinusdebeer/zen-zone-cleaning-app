import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, DollarSign, Users, Briefcase, Calendar } from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track your business performance and growth</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$12,450</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <DollarSign className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">34</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8.3% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Briefcase className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+25% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Users className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Job Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$366</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+5.2% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <BarChart3 className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h2>
        <div className="h-64 flex items-end justify-around space-x-2">
          {[8500, 9200, 10100, 11300, 10800, 12450].map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-[#4a7c59] rounded-t-lg transition-all hover:bg-[#4a8c37]"
                style={{ height: `${(value / 12450) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">
                {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][index]}
              </span>
              <span className="text-xs text-gray-500">${(value / 1000).toFixed(1)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* More Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Home Cleaning</span>
                <span className="text-sm font-semibold text-gray-900">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#4a7c59] h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Deep Cleaning</span>
                <span className="text-sm font-semibold text-gray-900">28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#4a7c59] h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Office Cleaning</span>
                <span className="text-sm font-semibold text-gray-900">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#4a7c59] h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Move In/Out</span>
                <span className="text-sm font-semibold text-gray-900">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#4a7c59] h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Team A</p>
                <p className="text-sm text-gray-600">18 jobs completed</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[#4a7c59]">$6,750</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Team B</p>
                <p className="text-sm text-gray-600">16 jobs completed</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[#4a7c59]">$5,700</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Retention */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4a7c59]">78%</p>
            <p className="text-sm text-gray-600 mt-1">Client Retention Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4a7c59]">4.8</p>
            <p className="text-sm text-gray-600 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4a7c59]">2.4</p>
            <p className="text-sm text-gray-600 mt-1">Jobs per Client</p>
          </div>
        </div>
      </div>
    </div>
  );
}
