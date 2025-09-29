import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserCheck, Mail, Phone, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function TeamPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock team data
  const teamMembers = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Team Lead',
      email: 'john@zenzonecleaning.com',
      phone: '(705) 555-0101',
      status: 'active',
      jobsCompleted: 45,
      joinedDate: new Date('2024-06-01'),
    },
    {
      id: '2',
      name: 'Emily Davis',
      role: 'Cleaner',
      email: 'emily@zenzonecleaning.com',
      phone: '(705) 555-0102',
      status: 'active',
      jobsCompleted: 38,
      joinedDate: new Date('2024-07-15'),
    },
    {
      id: '3',
      name: 'Michael Brown',
      role: 'Cleaner',
      email: 'michael@zenzonecleaning.com',
      phone: '(705) 555-0103',
      status: 'active',
      jobsCompleted: 42,
      joinedDate: new Date('2024-05-20'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team and track performance</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{teamMembers.length}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <UserCheck className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{teamMembers.filter(m => m.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Performance</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">4.8/5.0</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <UserCheck className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Team Members</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-[#4a7c59] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {member.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-[#4a7c59] font-medium">{member.role}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {member.joinedDate.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Jobs Completed</span>
                    <span className="text-sm font-semibold text-gray-900">{member.jobsCompleted}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-[#4a7c59] text-[#4a7c59] rounded-lg hover:bg-[#f7faf7] transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-[#4a7c59] text-white rounded-lg hover:bg-[#4a8c37] transition-colors">
                    Assign Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
