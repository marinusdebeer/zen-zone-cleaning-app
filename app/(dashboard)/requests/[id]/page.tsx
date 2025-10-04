/**
 * REQUEST DETAIL PAGE
 * Route: /requests/[id]
 * 
 * Purpose:
 * View request details and convert to estimate/job
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { withOrgContext } from "@/server/tenancy";
import { serialize } from "@/lib/serialization";
import { User, FileText, MapPin, AlertCircle, Calendar, Globe, CheckCircle, ArrowRight, DollarSign, Home, Package, Clock as ClockIcon, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { getClientDisplayName } from '@/lib/client-utils';
import { RequestActions } from "./request-actions";
import { RequestImagesGallery } from "../_components/request-images-gallery";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  const { id } = await params;

  // Fetch request with relations
  const request = await withOrgContext(selectedOrgId, async () => {
    return await prisma.request.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        industry: { select: { label: true } },
        serviceType: { select: { label: true } },
        hearAbout: { select: { label: true } },
      },
    });
  });

  if (!request) {
    return <div>Request not found</div>;
  }

  const serializedRequest = serialize(request);
  const details = serializedRequest.details as any;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'normal': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'low': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'CONTACTED': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'QUOTED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'CONVERTED': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'DECLINED': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const client = serializedRequest.client;
  const property = serializedRequest.property;
  const pricing = details?.pricing;
  const propertyDetails = details?.propertyDetails;
  const serviceDetails = details?.serviceDetails;
  const scheduling = details?.scheduling;
  const addOns = details?.addOns;
  const marketingInfo = details?.marketingInfo;
  const images = details?.images;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{serializedRequest.title}</h1>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                #{serializedRequest.number}
              </span>
            </div>
            {details?.submissionId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Submission ID: {details.submissionId}
            </p>
            )}
          </div>
          {serializedRequest.status !== 'CONVERTED' && serializedRequest.status !== 'DECLINED' && (
            <RequestActions requestId={serializedRequest.id} status={serializedRequest.status} />
          )}
        </div>

        {/* Status & Urgency Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(serializedRequest.status)}`}>
            {serializedRequest.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(serializedRequest.urgency)}`}>
            {serializedRequest.urgency.toUpperCase()} Priority
          </span>
          {serializedRequest.source && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              Source: {serializedRequest.source}
            </span>
          )}
          {serializedRequest.industry && (
            <span className="px-3 py-1 bg-brand-bg-tertiary text-brand rounded-full text-sm font-medium">
              {serializedRequest.industry.label}
            </span>
          )}
          {serializedRequest.serviceType && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              {serializedRequest.serviceType.label}
            </span>
          )}
        </div>

        {/* Client Info */}
        <div className="mt-6 p-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Client</p>
              <Link 
                href={`/clients/${client.id}`}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-brand flex items-center"
              >
                {getClientDisplayName(client)} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <div className="flex gap-4 mt-2">
                {client.emails && Array.isArray(client.emails) && client.emails[0] && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {client.emails[0]}
                  </p>
                )}
                {client.phones && Array.isArray(client.phones) && client.phones[0] && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {client.phones[0]}
                  </p>
                )}
              </div>
              {property && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {serializedRequest.description && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-brand" />
            Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{serializedRequest.description}</p>
        </div>
      )}

      {/* Pricing Information */}
      {pricing && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-brand" />
            Pricing Estimate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${pricing.estimatedPrice}</p>
            </div>
            {pricing.priceRange && (
              <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price Range</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${pricing.priceRange.min} - ${pricing.priceRange.max}
                </p>
              </div>
            )}
            {pricing.confidence && (
              <div className="bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Confidence</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{pricing.confidence}</p>
              </div>
            )}
          </div>
          
          {/* Recurring Pricing */}
          {pricing.recurringInfo && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Per Visit</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">${pricing.recurringInfo.perVisitPrice}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Yearly Value</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">${pricing.recurringInfo.yearlyValue}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Frequency Discount</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">{pricing.recurringInfo.frequencyDiscount}%</p>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {pricing.breakdown && (
            <div className="mt-4 bg-brand-bg-secondary dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Breakdown</p>
              <div className="space-y-2 text-sm">
                {pricing.breakdown.basePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                    <span className="text-gray-900 dark:text-white font-medium">${pricing.breakdown.basePrice}</span>
                  </div>
                )}
                {pricing.breakdown.basementCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Basement</span>
                    <span className="text-gray-900 dark:text-white font-medium">+${pricing.breakdown.basementCost}</span>
                  </div>
                )}
                {pricing.breakdown.addOnsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Add-ons</span>
                    <span className="text-gray-900 dark:text-white font-medium">+${pricing.breakdown.addOnsTotal}</span>
                  </div>
                )}
                {pricing.breakdown.recurringDiscount && pricing.breakdown.recurringDiscount < 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Recurring Discount</span>
                    <span className="font-medium">${pricing.breakdown.recurringDiscount}</span>
                  </div>
                )}
                {pricing.breakdown.firstTimeDeepCleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">First Deep Clean</span>
                    <span className="text-gray-900 dark:text-white font-medium">+${pricing.breakdown.firstTimeDeepCleaningFee}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Property Details */}
      {propertyDetails && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2 text-brand" />
            Property Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyDetails.propertyType && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.propertyType}</p>
              </div>
            )}
            {propertyDetails.squareFootage && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Size</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.squareFootage} sq ft</p>
              </div>
            )}
            {propertyDetails.bedrooms && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.bedrooms}</p>
              </div>
            )}
            {propertyDetails.bathrooms && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.bathrooms}</p>
              </div>
            )}
            {propertyDetails.basement && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Basement</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.basement}</p>
              </div>
            )}
            {propertyDetails.pets && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Pets</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{propertyDetails.pets}</p>
              </div>
            )}
            {propertyDetails.petDetails && (
              <div className="col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">Pet Details</p>
                <p className="text-sm text-gray-900 dark:text-white">{propertyDetails.petDetails}</p>
              </div>
            )}
            {propertyDetails.parkingInfo && (
              <div className="col-span-2 md:col-span-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Parking</p>
                <p className="text-sm text-gray-900 dark:text-white">{propertyDetails.parkingInfo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Details */}
      {serviceDetails && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand" />
            Service Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {serviceDetails.bookingType && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Booking Type</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{serviceDetails.bookingType}</p>
              </div>
            )}
            {serviceDetails.frequency && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Frequency</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{serviceDetails.frequency}</p>
              </div>
            )}
            {serviceDetails.firstTimeDeepCleaning !== undefined && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">First Deep Clean</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {serviceDetails.firstTimeDeepCleaning ? 'Yes' : 'No'}
                </p>
              </div>
            )}
            {serviceDetails.reason && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Reason</p>
                <p className="text-sm text-gray-900 dark:text-white">{serviceDetails.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add-Ons */}
      {addOns && addOns.extras && addOns.extras.length > 0 && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-brand" />
            Add-Ons & Extras
          </h2>
          <div className="space-y-3">
            {addOns.extras.map((extra: string, idx: number) => (
              <div key={idx} className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-gray-900 dark:text-white">{extra}</span>
              </div>
            ))}
            {addOns.interiorWindows && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">Interior Windows</p>
                <p className="text-sm text-gray-900 dark:text-white">{addOns.interiorWindows}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduling */}
      {scheduling && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-brand" />
            Scheduling & Access
          </h2>
          <div className="space-y-3">
            {scheduling.datePreferences && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Date Preferences</p>
                <p className="text-sm text-gray-900 dark:text-white">{scheduling.datePreferences}</p>
              </div>
            )}
            {scheduling.accessMethod && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Access Method</p>
                <p className="text-sm text-gray-900 dark:text-white">{scheduling.accessMethod}</p>
              </div>
            )}
            {scheduling.specialRequests && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Special Requests</p>
                <p className="text-sm text-gray-900 dark:text-white">{scheduling.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketing Info */}
      {(serializedRequest.hearAbout || marketingInfo?.referralName) && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-brand" />
            Marketing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serializedRequest.hearAbout && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">How They Heard About Us</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{serializedRequest.hearAbout.label}</p>
              </div>
            )}
            {marketingInfo?.referralName && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Referred By</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{marketingInfo.referralName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images Gallery */}
      <RequestImagesGallery requestId={serializedRequest.id} images={images || {}} />

      {/* Notes */}
      {serializedRequest.notes && (
        <div className="bg-brand-bg rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Internal Notes</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{serializedRequest.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-brand-bg rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-brand" />
          Timeline
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white ml-2">
              {new Date(serializedRequest.createdAt).toLocaleString()}
            </span>
          </div>
          {details?.formVersion && (
            <div className="flex items-center text-sm">
              <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Form Version:</span>
              <span className="text-gray-900 dark:text-white ml-2">{details.formVersion}</span>
            </div>
          )}
          {details?.metadata?.deviceType && (
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Submitted from:</span>
              <span className="text-gray-900 dark:text-white ml-2 capitalize">{details.metadata.deviceType}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

