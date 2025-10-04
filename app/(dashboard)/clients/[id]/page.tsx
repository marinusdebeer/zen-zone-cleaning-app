/**
 * CLIENT DETAIL PAGE
 * Route: /clients/[id]
 * 
 * Purpose:
 * - Display comprehensive client information
 * - Show all properties, jobs, estimates, and invoices
 * - Provide contact details and history
 * 
 * Data Fetching:
 * - Fetches client with all relations:
 *   - properties, jobs, estimates, invoices, convertedFromLead
 * - Jobs include visit counts
 * - Invoices include payment totals
 * 
 * Component:
 * - Server component (static rendering of client data)
 * 
 * Notes:
 * - Email/phone stored as JSON arrays
 * - Shows stats: total jobs, active jobs, total invoiced, total paid
 * - Lists all associated properties, jobs, estimates, invoices
 * - Theme-compliant design
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { Mail, Phone, MapPin, FileText, Briefcase, Receipt, Home, CheckCircle } from 'lucide-react';
import { ClientActions } from './client-actions';

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
        estimates: { 
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' } 
        },
        jobs: { 
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' } 
        },
        invoices: { 
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' } 
        },
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
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/clients" className="hover:text-brand">Clients</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Client ID: {client.id.slice(0, 8)}</p>
          </div>
          <ClientActions clientId={client.id} />
        </div>

        {/* Contact Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-brand" />
              Email
            </h3>
            {emails.length > 0 ? (
              <div className="space-y-1">
                {emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="block text-sm text-brand hover:text-brand-dark">
                    {email}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No email</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-brand" />
              Phone
            </h3>
            {phones.length > 0 ? (
              <div className="space-y-1">
                {phones.map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="block text-sm text-brand hover:text-brand-dark">
                    {phone}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No phone</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-brand" />
              Address
            </h3>
            {addresses.length > 0 ? (
              <div className="space-y-1">
                {addresses.map((address, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{address}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No address</p>
            )}
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-brand" />
          Properties ({client.properties.length})
        </h2>
        {client.properties.length > 0 ? (
          <div className="space-y-3">
            {client.properties.map(property => (
              <div key={property.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{property.address}</p>
                    {property.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{property.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No properties on file</p>
        )}
      </div>

      {/* Estimates */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-brand" />
          Estimates ({client.estimates.length})
        </h2>
        {client.estimates.length > 0 ? (
          <div className="space-y-3">
            {client.estimates.map(estimate => (
              <Link 
                key={estimate.id}
                href={`/estimates/${estimate.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{estimate.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{estimate.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        estimate.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        estimate.status === 'Sent' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800'
                      }`}>{estimate.status}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{estimate.lineItems?.length || 0} items</span>
                    </div>
                  </div>
                  <span className="text-brand text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No estimates yet</p>
        )}
      </div>

      {/* Jobs */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-brand" />
          Jobs ({client.jobs.length})
        </h2>
        {client.jobs.length > 0 ? (
          <div className="space-y-3">
            {client.jobs.map(job => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white">{job.title || job.client.name}</p>
                      {job.isRecurring && (
                        <span className="text-xs bg-brand-bg-tertiary text-brand-text px-2 py-0.5 rounded">Recurring</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        job.status === 'Completed' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800'
                      }`}>{job.status}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{job.lineItems?.length || 0} items</span>
                    </div>
                  </div>
                  <span className="text-brand text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No jobs yet</p>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-brand" />
          Invoices ({client.invoices.length})
        </h2>
        {client.invoices.length > 0 ? (
          <div className="space-y-3">
            {client.invoices.map(invoice => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Invoice #{invoice.number}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        invoice.status === 'Sent' ? 'bg-brand-bg-tertiary text-blue-800 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800'
                      }`}>{invoice.status}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{invoice.lineItems?.length || 0} items</span>
                    </div>
                  </div>
                  <span className="text-brand text-sm font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No invoices yet</p>
        )}
      </div>
    </div>
  );
}
