import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { getClients } from '@/server/actions/clients';
import { ClientForm } from './client-form';

export default async function ClientsPage() {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Client Directory
              </h3>
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No clients found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create your first client using the form
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{client.name}</h4>
                          <div className="mt-1 space-y-1">
                            {Array.isArray(client.emails) && client.emails.length > 0 && (
                              <p className="text-sm text-gray-600">
                                📧 {(client.emails as string[]).join(', ')}
                              </p>
                            )}
                            {Array.isArray(client.phones) && client.phones.length > 0 && (
                              <p className="text-sm text-gray-600">
                                📞 {(client.phones as string[]).join(', ')}
                              </p>
                            )}
                            {Array.isArray(client.addresses) && client.addresses.length > 0 && (
                              <p className="text-sm text-gray-600">
                                📍 {(client.addresses as string[]).join('; ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-[#4a7c59] hover:text-[#4a8c37] text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Client Form */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Client
              </h3>
              <ClientForm orgId={selectedOrgId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}