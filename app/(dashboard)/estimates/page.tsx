import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function EstimatesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock data - will be replaced with real data
  const estimates = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      propertyAddress: '123 Main St, Barrie',
      serviceType: 'Deep Clean',
      amount: 350,
      status: 'pending',
      createdAt: new Date('2025-01-15'),
      validUntil: new Date('2025-02-15'),
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      propertyAddress: '456 Business Blvd, Barrie',
      serviceType: 'Commercial Clean',
      amount: 850,
      status: 'approved',
      createdAt: new Date('2025-01-10'),
      validUntil: new Date('2025-02-10'),
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>;
      default:
        return null;
    }
  };

  const stats = {
    total: estimates.length,
    pending: estimates.filter(e => e.status === 'pending').length,
    approved: estimates.filter(e => e.status === 'approved').length,
    totalValue: estimates.reduce((sum, e) => sum + e.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-600 mt-1">Manage quotes and service estimates</p>
        </div>
        <Link
          href="/estimates/new"
          className="inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Estimate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Estimates</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <FileText className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">${stats.totalValue}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <FileText className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Estimates List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Estimates</h2>
        </div>
        
        {estimates.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No estimates yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first estimate to provide quotes to clients
            </p>
            <Link
              href="/estimates/new"
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Estimate
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {estimate.clientName}
                        </h3>
                        {getStatusBadge(estimate.status)}
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Service:</strong> {estimate.serviceType}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Property:</strong> {estimate.propertyAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Amount:</strong> <span className="text-[#4a7c59] font-semibold">${estimate.amount.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Valid until: {estimate.validUntil.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        href={`/estimates/${estimate.id}`}
                        className="text-[#4a7c59] hover:text-[#4a8c37] text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {estimate.status === 'approved' && (
                        <Link
                          href={`/jobs/new?estimateId=${estimate.id}`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Create Job
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
