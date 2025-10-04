/**
 * PROPERTY DETAIL PAGE
 * Route: /properties/[id]
 * 
 * Purpose:
 * View property details, linked jobs, and edit property information
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { Home, MapPin, User, Briefcase, FileText, Edit2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getClientDisplayName } from '@/lib/client-utils';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch property with relations
  const property = await withOrgContext(selectedOrgId, async () => {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        client: true,
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        estimates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  });

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-brand-bg rounded-xl shadow-sm p-8 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Property Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This property doesn't exist or you don't have access to it.</p>
          <Link href="/clients" className="text-brand hover:text-brand-dark font-medium">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const serializedProperty = serialize(property);
  const custom = serializedProperty.custom as any;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/clients/${property.clientId}`} className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-brand mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {getClientDisplayName(property.client)}
            </Link>
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-brand" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.address}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Property for {getClientDisplayName(property.client)}
                </p>
              </div>
            </div>
          </div>
          <Link
            href={`/properties/${property.id}/edit`}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Property
          </Link>
        </div>
      </div>

      {/* Property Details */}
      <Link 
        href={`/properties/${property.id}/edit`}
        className="block bg-brand-bg rounded-xl shadow-sm p-6 hover:bg-brand-bg-tertiary transition-colors cursor-pointer"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-brand" />
          Property Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Address</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{property.address}</p>
          </div>

          {/* Client */}
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Client</p>
            <p className="text-sm font-medium text-brand">
              {getClientDisplayName(property.client)}
            </p>
          </div>

          {/* Property Details from custom JSON */}
          {custom?.propertyType && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Property Type</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.propertyType}</p>
            </div>
          )}

          {custom?.squareFootage && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Square Footage</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.squareFootage.toLocaleString()} sq ft</p>
            </div>
          )}

          {custom?.bedrooms && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.bedrooms}</p>
            </div>
          )}

          {custom?.bathrooms && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.bathrooms}</p>
            </div>
          )}

          {custom?.basement && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Basement</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.basement}</p>
            </div>
          )}

          {custom?.pets && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pets</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{custom.pets}</p>
              {custom.petDetails && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{custom.petDetails}</p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {property.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{property.notes}</p>
          </div>
        )}
      </Link>

      {/* Related Jobs */}
      {property.jobs && property.jobs.length > 0 && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-brand" />
            Jobs at This Property ({property.jobs.length})
          </h2>
          <div className="space-y-3">
            {property.jobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Job #{job.number} - {job.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {job.status}
                      {job.isRecurring && ' • Recurring'}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Estimates */}
      {property.estimates && property.estimates.length > 0 && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand" />
            Estimates for This Property ({property.estimates.length})
          </h2>
          <div className="space-y-3">
            {property.estimates.map((estimate: any) => (
              <Link
                key={estimate.id}
                href={`/estimates/${estimate.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Estimate #{estimate.number} - {estimate.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {estimate.status}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Requests */}
      {property.requests && property.requests.length > 0 && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand" />
            Requests for This Property ({property.requests.length})
          </h2>
          <div className="space-y-3">
            {property.requests.map((request: any) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Request #{request.number} - {request.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {request.status}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

