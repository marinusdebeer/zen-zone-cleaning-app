import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, Plus, Check, X } from 'lucide-react';

export default async function ServiceAreasPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock service areas data
  const serviceAreas = [
    {
      id: '1',
      name: 'Barrie Downtown',
      postalCodes: ['L4M', 'L4N'],
      active: true,
      jobs: 45,
      avgTravelTime: '15 min',
    },
    {
      id: '2',
      name: 'Barrie South',
      postalCodes: ['L4N'],
      active: true,
      jobs: 38,
      avgTravelTime: '20 min',
    },
    {
      id: '3',
      name: 'Orillia',
      postalCodes: ['L3V'],
      active: true,
      jobs: 22,
      avgTravelTime: '35 min',
    },
    {
      id: '4',
      name: 'Innisfil',
      postalCodes: ['L9S'],
      active: true,
      jobs: 18,
      avgTravelTime: '25 min',
    },
    {
      id: '5',
      name: 'Collingwood',
      postalCodes: ['L9Y'],
      active: false,
      jobs: 0,
      avgTravelTime: 'N/A',
    },
  ];

  const activeAreas = serviceAreas.filter(area => area.active);
  const totalJobs = activeAreas.reduce((sum, area) => sum + area.jobs, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Areas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage locations where you provide services</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Service Area
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Areas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activeAreas.length}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <MapPin className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalJobs}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <MapPin className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coverage</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">Simcoe County</p>
            </div>
            <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
              <MapPin className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Company Address */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Location</h2>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
            <MapPin className="h-6 w-6 text-[#4a7c59]" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Zen Zone Cleaning Services</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">49 High St Suite 300</p>
            <p className="text-gray-600 dark:text-gray-400">Barrie, ON L4N 5J4</p>
            <p className="text-gray-600 dark:text-gray-400">Canada 🇨🇦</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">(705) 242-1166</p>
          </div>
        </div>
      </div>

      {/* Service Areas List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Service Areas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceAreas.map((area) => (
              <div key={area.id} className={`border rounded-lg p-6 transition-shadow ${area.active ? 'border-[#4a7c59] hover:shadow-lg' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#f7faf7] dark:bg-gray-700 rounded-lg">
                    <MapPin className="h-6 w-6 text-[#4a7c59]" />
                  </div>
                  {area.active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      <X className="w-3 h-3 mr-1" /> Inactive
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{area.name}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Postal Codes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{area.postalCodes.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Jobs Completed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{area.jobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Travel:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{area.avgTravelTime}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-[#4a7c59] text-[#4a7c59] rounded-lg hover:bg-[#f7faf7] dark:hover:bg-gray-700 transition-colors">
                    Edit
                  </button>
                  <button className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    area.active 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' 
                      : 'bg-[#4a7c59] text-white hover:bg-[#4a8c37]'
                  }`}>
                    {area.active ? 'Deactivate' : 'Activate'}
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
