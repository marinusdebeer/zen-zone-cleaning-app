import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { getJobs } from '@/server/actions/jobs';

function formatDate(date: Date | null) {
  if (!date) return 'Not scheduled';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'inprogress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'qa': return 'bg-purple-100 text-purple-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function JobsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const jobs = await getJobs(selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Link
          href="/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Create New Job
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No jobs found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first job to get started
              </p>
              <Link
                href="/jobs/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {job.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Client:</strong> {job.client.name}
                        </p>
                        
                        {job.property && (
                          <p className="text-sm text-gray-600">
                            <strong>Property:</strong> {job.property.address}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600">
                          <strong>Scheduled:</strong> {formatDate(job.scheduledAt)}
                        </p>
                        
                        {Array.isArray(job.assignees) && job.assignees.length > 0 && (
                          <p className="text-sm text-gray-600">
                            <strong>Assignees:</strong> {(job.assignees as string[]).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Custom fields */}
                      {job.custom && typeof job.custom === 'object' && (
                        <div className="mt-3 space-y-1">
                          {Object.entries(job.custom as Record<string, any>).map(([key, value]) => (
                            value && (
                              <p key={key} className="text-sm text-gray-500">
                                <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                              </p>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-[#4a7c59] hover:text-[#4a8c37] text-sm font-medium"
                      >
                        View Details →
                      </Link>
                      
                      {job.status === 'Completed' && (
                        <Link
                          href={`/invoices/new?jobId=${job.id}`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Create Invoice
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}