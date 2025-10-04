/**
 * WEBSITE FORM INGESTION API
 * 
 * POST /api/requests
 * 
 * Purpose:
 * Accept evolving JSON form data from website, normalize key fields,
 * store full snapshot, and create Request with Client and Property
 * 
 * Security:
 * Protected by x-zenzone-secret header matching FORM_INGEST_SECRET env var
 * 
 * Features:
 * - Flexible schema with .passthrough() for evolving forms
 * - Normalizes industry, serviceType, hearAbout via lookup tables
 * - Stores complete form snapshot in details JSON field
 * - Creates Client (as LEAD) and Property automatically
 * - Allocates per-org sequential numbers
 * - Logs activity for audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getNextNumber } from '@/server/utils/auto-number';
import { getOrgBySlug } from '@/server/tenancy';

// CORS headers for cross-origin requests
// Allowed origins: production website and localhost for testing
const ALLOWED_ORIGINS = [
  'https://zenzonecleaning.ca',
  'https://www.zenzonecleaning.ca',
  'http://localhost:3000',  // For local testing
  'http://localhost:4000',  // For local website testing
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-zenzone-secret',
  };
};

// Handle OPTIONS (preflight) request
export async function OPTIONS(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Flexible schema that accepts evolving form fields from website
// All fields are optional - website controls validation
const requestSchema = z.object({
  submissionId: z.string().optional(),
  timestamp: z.string().optional(),
  formVersion: z.string().optional(),
  
  contactInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().nullable().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  
  serviceDetails: z.object({
    industry: z.string().optional(),
    bookingType: z.string().optional(),
    cleaningType: z.string().optional(),
    frequency: z.string().nullable().optional(),
    firstTimeDeepCleaning: z.boolean().optional(),
    reason: z.string().optional(),
    reasonOther: z.string().nullable().optional(),
  }).optional(),
  
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  
  propertyDetails: z.any().optional(),
  addOns: z.any().optional(),
  
  // Images - Zip archive from email
  images: z.object({
    folder: z.string().nullable().optional(),
    archiveLink: z.string().nullable().optional(),
    count: z.number().optional(),
    noPhotosReason: z.string().nullable().optional(),
  }).optional(),
  
  scheduling: z.object({
    datePreferences: z.string().optional(),
    accessMethod: z.string().optional(),
    accessDetails: z.string().nullable().optional(),
    specialRequests: z.string().optional(),
  }).optional(),
  marketingInfo: z.object({
    hearAbout: z.string().optional(),
    referralName: z.string().nullable().optional(),
    hearAboutOther: z.string().nullable().optional(),
  }).optional(),
  pricing: z.any().optional(),
  metadata: z.any().optional(),
  
  // Allow any additional evolving fields
}).passthrough();

/**
 * Parse preferred datetime from scheduling section
 * Handles ISO strings and natural language date preferences
 */
function parsePreferredAt(data: any): Date | null {
  // Try scheduling.datePreferences (from your actual form)
  const datePrefs = data?.scheduling?.datePreferences;
  if (typeof datePrefs === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(datePrefs)) {
    return new Date(datePrefs);
  }
  
  // Fallback to old format for backwards compatibility
  const pref = data?.scheduleAndAccess?.preferred;
  if (typeof pref === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(pref)) {
    return new Date(pref);
  }
  
  if (pref instanceof Date) {
    return pref;
  }
  
  return null;
}

/**
 * Map industry label to slug for lookup
 */
function mapIndustryToSlug(industry: string): string {
  const map: Record<string, string> = {
    'Home Cleaning': 'home-cleaning',
    'Office Cleaning': 'office',
    'Airbnb Cleaning': 'airbnb',
  };
  return map[industry] || industry.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Map cleaning type to service type slug
 */
function mapCleaningTypeToSlug(cleaningType: string): string {
  const map: Record<string, string> = {
    'Standard Cleaning': 'standard',
    'Deep Cleaning': 'deep',
    'Moving Standard Cleaning': 'moving-standard',
    'Moving Deep Cleaning': 'moving-deep',
    'Post-Renovation Cleaning': 'post-renovation',
    'Recurring Cleaning': 'recurring',
    'Office Cleaning': 'office',
    'Airbnb Cleaning': 'airbnb',
  };
  return map[cleaningType] || cleaningType.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Map hear about source to slug
 */
function mapHearAboutToSlug(hearAbout: string): string {
  const map: Record<string, string> = {
    'Google Maps or GBP': 'gbp',
    'Google Guaranteed': 'google-guaranteed',
    'Brochure': 'brochure',
    'Referral': 'referral',
    'Other': 'other',
  };
  return map[hearAbout] || hearAbout.toLowerCase().replace(/\s+/g, '-');
}

export async function POST(req: NextRequest) {
  // Get CORS headers based on origin
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  try {
    // Security: Check secret header
    const secret = req.headers.get('x-zenzone-secret');
    if (secret !== process.env.FORM_INGEST_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse and validate request body
    const payload = await req.json();
    const data = requestSchema.parse(payload);

    // Determine organization from slug in env
    const orgSlug = process.env.DEFAULT_ORG_ID;
    if (!orgSlug) {
      return NextResponse.json(
        { error: 'DEFAULT_ORG_ID not configured in environment' }, 
        { status: 500, headers: corsHeaders }
      );
    }

    // Look up organization by slug
    const organization = await getOrgBySlug(orgSlug);
    if (!organization) {
      return NextResponse.json(
        { error: `Organization not found: ${orgSlug}` }, 
        { status: 500, headers: corsHeaders }
      );
    }
    
    const orgId = organization.id;

    // Map labels to slugs and resolve lookup IDs (all optional)
    const industrySlug = data.serviceDetails?.industry 
      ? mapIndustryToSlug(data.serviceDetails.industry)
      : 'home-cleaning'; // Default to home cleaning if not specified
    
    const serviceTypeSlug = data.serviceDetails?.cleaningType 
      ? mapCleaningTypeToSlug(data.serviceDetails.cleaningType)
      : 'standard';
    
    const hearAboutSlug = data.marketingInfo?.hearAbout 
      ? mapHearAboutToSlug(data.marketingInfo.hearAbout)
      : null;

    const industry = await prisma.industry.findUnique({ 
      where: { slug: industrySlug } 
    });
    
    const serviceType = await prisma.serviceType.findUnique({ 
      where: { slug: serviceTypeSlug } 
    });

    // If industry doesn't exist, use the first available one as fallback
    const resolvedIndustry = industry || await prisma.industry.findFirst();

    // Create service type if it doesn't exist (flexible ingestion)
    const resolvedServiceType = serviceType || (resolvedIndustry ? await prisma.serviceType.create({
      data: {
        industryId: resolvedIndustry.id,
        slug: serviceTypeSlug,
        label: data.serviceDetails?.cleaningType || 'Standard Cleaning',
        active: true,
      },
    }) : null);

    const hearAbout = hearAboutSlug
      ? await prisma.hearAbout.findUnique({ 
          where: { slug: hearAboutSlug } 
        })
      : null;

    // Create Client (as LEAD)
    const clientNumber = await getNextNumber(orgId, 'client');
    const client = await prisma.client.create({
      data: {
        orgId,
        number: clientNumber,
        firstName: data.contactInfo?.company ? null : (data.contactInfo?.firstName || null),
        lastName: data.contactInfo?.company ? null : (data.contactInfo?.lastName || null),
        companyName: data.contactInfo?.company || null,
        emails: data.contactInfo?.email ? [data.contactInfo.email] : [],
        phones: data.contactInfo?.phone ? [data.contactInfo.phone] : [],
        clientStatus: 'LEAD',
        leadSource: hearAboutSlug || 'website',
        leadStatus: 'NEW',
      },
    });

    // Create Property (if we have location data)
    const property = data.location ? await prisma.property.create({
      data: {
        orgId,
        clientId: client.id,
        address: [
          data.location.address,
          data.location.city,
          data.location.province,
          data.location.postalCode,
        ]
          .filter(Boolean)
          .join(', ') || 'Address not provided',
        notes: data.propertyDetails?.parkingInfo || null,
        custom: {
          propertyType: data.propertyDetails?.propertyType,
          squareFootage: data.propertyDetails?.squareFootage,
          levels: data.propertyDetails?.levels,
          bedrooms: data.propertyDetails?.bedrooms,
          bathrooms: data.propertyDetails?.bathrooms,
          basement: data.propertyDetails?.basement,
        },
      },
    }) : null;

    // Build request title from service details
    const title = `${data.serviceDetails?.industry || 'Service Request'} - ${data.serviceDetails?.cleaningType || 'Standard'}`;
    
    // Build description from various fields
    const descriptionParts = [];
    if (data.serviceDetails?.reason) descriptionParts.push(`Reason: ${data.serviceDetails.reason}`);
    if (data.scheduling?.specialRequests) descriptionParts.push(data.scheduling.specialRequests);
    const description = descriptionParts.join('\n') || null;

    // Create Request with full form snapshot
    const requestNumber = await getNextNumber(orgId, 'request');
    const request = await prisma.request.create({
      data: {
        orgId,
        number: requestNumber,
        clientId: client.id,
        propertyId: property?.id || null,
        title,
        description,
        source: hearAboutSlug || 'website',
        status: 'NEW',
        urgency: 'normal',
        industryId: resolvedIndustry?.id || null,
        serviceTypeId: resolvedServiceType?.id || null,
        hearAboutId: hearAbout?.id || null,
        details: {
          ...payload, // Store entire payload
          meta: {
            formVersion: data.formVersion || 'unknown',
            submissionId: data.submissionId,
            ingested: new Date().toISOString(),
            industrySlug,
            serviceTypeSlug,
            hearAboutSlug,
          },
        },
        preferredAt: parsePreferredAt(data),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        orgId,
        requestId: request.id,
        type: 'SYSTEM',
        message: 'Request created via website form',
        meta: {
          source: 'website',
          submissionId: data.submissionId,
          industry: data.serviceDetails.industry,
          cleaningType: data.serviceDetails.cleaningType,
          estimatedPrice: data.pricing?.estimatedPrice,
          imageCount: data.images?.count || 0,
          hasImages: !!data.images?.archiveLink,
        },
      },
    });

    // Success response
    return NextResponse.json(
      {
        success: true,
        requestId: request.id,
        requestNumber: request.number,
        clientId: client.id,
        clientNumber: client.number,
        propertyId: property.id,
        submissionId: data.submissionId,
        message: 'Request received successfully',
      },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Form ingestion error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
      const errorMessages = error.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || [];
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          validationErrors: error.errors,
          message: errorMessages.join(', ') || 'Validation error'
        }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : String(error)
        })
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

