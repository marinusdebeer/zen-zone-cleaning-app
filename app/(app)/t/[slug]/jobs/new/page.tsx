import { getOrgBySlug } from '@/server/tenancy';
import { getClients } from '@/server/actions/clients';
import { JobWizard } from './job-wizard';

interface NewJobPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewJobPage({ params }: NewJobPageProps) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) {
    return <div>Organization not found</div>;
  }

  const clients = await getClients(org.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600 mt-1">
          Follow the wizard to create a new job
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <JobWizard 
            org={org} 
            clients={clients}
          />
        </div>
      </div>
    </div>
  );
}
