import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { ArrowLeft, Mail, Phone, MapPin, FileText, Briefcase, Receipt, Home, CheckCircle } from 'lucide-react';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) return <div>No organization selected</div>;

  const { id } = await params;

  const client = await withOrgContext(selectedOrgId, async () => {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        properties: true,
        estimates: { orderBy: { createdAt: 'desc' } },
        jobs: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });
  });

  if (!client) return <div>Client not found</div>;

  const emails = Array.isArray(client.emails) ? client.emails as string[] : [];
  const phones = Array.isArray(client.phones) ? client.phones as string[] : [];
  const addresses = Array.isArray(client.addresses) ? client.addresses as string[] : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/clients" className="hover:text-[#4a7c59]">Clients</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Client ID: {client.id.slice(0, 8)}</p>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
        </div>

        {/* Contact Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-[#4a7c59]" />
              Email
            </h3>
            {emails.length > 0 ? (
              <div className="space-y-1">
                {emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="block text-sm text-blue-600 hover:text-blue-800">
                    {email}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-[#4a7c59]" />
              Phone
            </h3>
            {phones.length > 0 ? (
              <div className="space-y-1">
                {phones.map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="block text-sm text-blue-600 hover:text-blue-800">
                    {phone}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No phone</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-[#4a7c59]" />
              Address
            </h3>
            {addresses.length > 0 ? (
              <div className="space-y-1">
                {addresses.map((address, i) => (
                  <p key={i} className="text-sm text-gray-700">{address}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No address</p>
            )}
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-[#4a7c59]" />
          Properties ({client.properties.length})
        </h2>
        {client.properties.length > 0 ? (
          <div className="space-y-3">
            {client.properties.map(property => (
              <div key={property.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{property.address}</p>
                    {property.notes && <p className="text-sm text-gray-600 mt-1">{property.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No properties on file</p>
        )}
      </div>

      {/* Estimates */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#4a7c59]" />
          Estimates ({client.estimates.length})
        </h2>
        {client.estimates.length > 0 ? (
          <div className="space-y-3">
            {client.estimates.map(estimate => (
              <Link 
                key={estimate.id}
                href={`/estimates/${estimate.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4a7c59] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{estimate.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{estimate.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-[#4a7c59] font-semibold">${estimate.amount.toString()}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        estimate.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        estimate.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{estimate.status}</span>
                    </div>
                  </div>
                  <span className="text-[#4a7c59] text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No estimates yet</p>
        )}
      </div>

      {/* Jobs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-[#4a7c59]" />
          Jobs ({client.jobs.length})
        </h2>
        {client.jobs.length > 0 ? (
          <div className="space-y-3">
            {client.jobs.map(job => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4a7c59] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      {job.isRecurring && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Recurring</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.status === 'Active' ? 'bg-green-100 text-green-800' :
                        job.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{job.status}</span>
                      {job.estimatedCost && (
                        <span className="text-sm text-gray-600">${job.estimatedCost.toString()}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[#4a7c59] text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No jobs yet</p>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-[#4a7c59]" />
          Invoices ({client.invoices.length})
        </h2>
        {client.invoices.length > 0 ? (
          <div className="space-y-3">
            {client.invoices.map(invoice => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4a7c59] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Invoice #{invoice.id.slice(0, 8)}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-lg text-[#4a7c59] font-bold">${invoice.total.toString()}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{invoice.status}</span>
                    </div>
                  </div>
                  <span className="text-[#4a7c59] text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No invoices yet</p>
        )}
      </div>
    </div>
  );
}
