import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClients } from '@/server/actions/clients';
import { JobWizard } from './job-wizard';

export default async function NewJobPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const clients = await getClients(selectedOrgId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600 mt-1">
          Fill in the details to create a new job
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <JobWizard 
            orgId={selectedOrgId} 
            clients={clients}
          />
        </div>
      </div>
    </div>
  );
}